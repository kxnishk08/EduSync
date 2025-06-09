// Controllers/StudentController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduSyncBackend.Data;
using EduSyncBackend.Models;
using EduSyncBackend.DTOs;
using System.Security.Claims;

namespace EduSyncBackend.Controllers
{
    [Route("api/student")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("enrolled-courses")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(studentId, out var studentGuid))
                return BadRequest("Invalid student ID.");

            var enrolledCourses = await _context.Enrollments
                .Where(e => e.UserId == studentGuid)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Instructor)
                .Select(e => new EnrolledCourseDto
                {
                    CourseId = e.Course.CourseId,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    InstructorName = e.Course.Instructor != null ? e.Course.Instructor.Name : "Unknown",
                    MediaUrl = e.Course.MediaUrl
                })
                .ToListAsync();

            return Ok(enrolledCourses);
        }

        [HttpPost("enroll")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EnrollInCourse([FromBody] EnrollmentRequest req)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(studentId, out var studentGuid))
                return BadRequest("Invalid student ID.");

            var courseId = req.CourseId;

            var exists = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == studentGuid);
            if (exists) return BadRequest("Already enrolled in this course.");

            // Get the current UTC time
            DateTime utcNow = DateTime.UtcNow;
            // Find the IST timezone info
            TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");


            var enrollment = new Enrollment
            {
                EnrollmentId = Guid.NewGuid(),
                CourseId = courseId,
                UserId = studentGuid,
                EnrolledOn = TimeZoneInfo.ConvertTimeFromUtc(utcNow, istZone)
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok("Enrolled successfully.");
        }




        [HttpGet("quiz-results")]
        public async Task<IActionResult> GetStudentQuizResults()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);


            var results = await _context.Results
                .Where(r => r.UserId == userId)
                .Include(r => r.Assessment)
                    .ThenInclude(a => a.Course)
                .ToListAsync();

            var grouped = results
                .GroupBy(r => r.Assessment.Course)
                .Select(courseGroup => new
                {
                    CourseId = courseGroup.Key.CourseId,
                    CourseTitle = courseGroup.Key.Title,
                    Assessments = courseGroup
                        .GroupBy(r => r.Assessment)
                        .Select(assessmentGroup => new
                        {
                            AssessmentId = assessmentGroup.Key.AssessmentId,
                            AssessmentTitle = assessmentGroup.Key.Title,
                            Score = assessmentGroup.First().Score,
                            AttemptDate = assessmentGroup.First().AttemptDate,
                            SelectedOptions = assessmentGroup.First().SelectedOptionsJson
                        })
                });

            return Ok(grouped);
        }


        [HttpGet("attempted-courses")]
        public async Task<IActionResult> GetAttemptedCourseIds()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user ID.");

            var attemptedCourseIds = await _context.Results
                .Include(r => r.Assessment)
                .Where(r => r.UserId == userId)
                .Select(r => r.Assessment.CourseId)
                .Distinct()
                .ToListAsync();

            return Ok(attemptedCourseIds);
        }


        [HttpGet("quiz-results/{courseId}")]
        public async Task<IActionResult> GetQuizResultsForCourse(Guid courseId)
        {
            var userIdString = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("Invalid user.");
            }

            var assessments = await _context.Assessments
                .Where(a => a.CourseId == courseId)
                .ToListAsync();

            var assessmentIds = assessments.Select(a => a.AssessmentId).ToList();

            var results = await _context.Results
                .Where(r => r.UserId == userId && assessmentIds.Contains(r.AssessmentId))
                .ToListAsync();

            var response = assessments.Select(a =>
            {
                var result = results.FirstOrDefault(r => r.AssessmentId == a.AssessmentId);

                return new
                {
                    assessmentId = a.AssessmentId,
                    assessmentTitle = a.Title,
                    total = a.MaxScore,
                    resultId = result?.ResultId,
                    score = result?.Score,
                    attemptDate = result?.AttemptDate
                };
            });

            return Ok(response);
        }






    }
}