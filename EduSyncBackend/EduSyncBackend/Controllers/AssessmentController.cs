using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs;
using EduSyncBackend.Data;
using EduSyncBackend.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace EduSyncBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AssessmentController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }



        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetAssessmentForCourse(Guid courseId)
        {
            // Validate course
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                return NotFound("Course not found");

            // ✅ Check if assessment already exists for this course
            var existingAssessment = await _context.Assessments
                .FirstOrDefaultAsync(a => a.CourseId == courseId);

            if (existingAssessment != null)
                return Ok(existingAssessment);  // 👈 Return the already created assessment

            // Read Azure Blob config
            string connectionString = _configuration["AzureBlobStorage:ConnectionString"];
            string containerName = _configuration["AzureBlobStorage:ContainerName"];
            string fileName = _configuration["AzureBlobStorage:FileName"];

            var blobClient = new BlobContainerClient(connectionString, containerName);
            var blob = blobClient.GetBlobClient(fileName);

            if (!await blob.ExistsAsync())
                return NotFound("Quiz file not found in Azure Blob Storage.");

            var stream = await blob.OpenReadAsync();
            using var reader = new StreamReader(stream);
            string jsonContent = await reader.ReadToEndAsync();

            var questions = JsonSerializer.Deserialize<List<Question>>(jsonContent);
            if (questions == null || questions.Count == 0)
                return BadRequest("Invalid or empty question file.");

            int maxScore = questions.Count;

            // ✅ Create only if not exists
            var newAssessment = new Assessment
            {
                AssessmentId = Guid.NewGuid(),
                CourseId = courseId,
                Title = "Default Shared Quiz",
                Questions = jsonContent,
                MaxScore = maxScore
            };

            _context.Assessments.Add(newAssessment);
            await _context.SaveChangesAsync();

            return Ok(newAssessment);
        }


        [HttpGet("student/quiz/{courseId}")]
        public async Task<IActionResult> GetOrCreateAssessmentForStudent(Guid courseId)
        {
            // 1. Get UserId from JWT Token
            var userIdClaim = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            if (userIdClaim == null)
                return Unauthorized("User not authenticated");

            Guid userId = Guid.Parse(userIdClaim.Value);

            // 2. Check if user is enrolled in this course
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

            if (!isEnrolled)
                return BadRequest("User is not enrolled in the specified course.");

            // 3. Check if assessment already exists for this course
            var assessment = await _context.Assessments
                .FirstOrDefaultAsync(a => a.CourseId == courseId);

            if (assessment == null)
            {
                // Create assessment from Azure Blob
                string connectionString = _configuration["AzureBlobStorage:ConnectionString"];
                string containerName = _configuration["AzureBlobStorage:ContainerName"];
                string fileName = _configuration["AzureBlobStorage:FileName"];

                var blobClient = new BlobContainerClient(connectionString, containerName);
                var blob = blobClient.GetBlobClient(fileName);

                if (!await blob.ExistsAsync())
                    return NotFound("Quiz file not found in Azure Blob Storage.");

                var stream = await blob.OpenReadAsync();
                using var reader = new StreamReader(stream);
                string jsonContent = await reader.ReadToEndAsync();

                var questions = JsonSerializer.Deserialize<List<Question>>(jsonContent);
                if (questions == null || questions.Count == 0)
                    return BadRequest("Invalid or empty question file.");

                assessment = new Assessment
                {
                    AssessmentId = Guid.NewGuid(),
                    CourseId = courseId,
                    Title = "Default Shared Quiz",
                    Questions = jsonContent,
                    MaxScore = questions.Count
                };

                _context.Assessments.Add(assessment);
                await _context.SaveChangesAsync();
            }

            // 4. Check if user has already attempted this assessment
            var resultExists = await _context.Results.AnyAsync(r =>
                r.AssessmentId == assessment.AssessmentId &&
                r.UserId == userId);

            // 5. Return assessment (or block if already attempted)
            if (resultExists)
            {
                return Ok(new
                {
                    message = "User has already attempted this assessment.",
                    alreadyAttempted = true
                });
            }

            return Ok(new
            {
                assessmentId = assessment.AssessmentId,
                title = assessment.Title,
                questions = assessment.Questions,
                alreadyAttempted = false
            });
        }



        // Define local class to deserialize
        private class Question
        {
            public Guid questionId { get; set; }
            public string question { get; set; }
            public List<string> options { get; set; }
            public string correctOption { get; set; }
            public int timeLimit { get; set; }
        }
    }
}