using Azure.Storage.Blobs;
using EduSyncBackend.Data;
using EduSyncBackend.DTOs;
using EduSyncBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System.Text.Json;

using Newtonsoft.Json;
using System.Security.Claims;
using System.Text;

namespace EduSyncBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public QuizController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuizQuestions()
        {
            try
            {
                // Read from appsettings.json
                var connectionString = _configuration["AzureBlobStorage:ConnectionString"];
                var containerName = _configuration["AzureBlobStorage:ContainerName"];
                var fileName = _configuration["AzureBlobStorage:FileName"];

                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var download = await blobClient.DownloadContentAsync();
                var jsonData = download.Value.Content.ToString();

                var questions = JsonConvert.DeserializeObject<List<BlobQuestionDTO>>(jsonData);

                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to fetch questions: {ex.Message}");
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitResult([FromBody] ResultDTO resultDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user ID.");

            // 🛑 Updated Guard: Block any attempt for the same course by this student
            var hasAlreadyAttemptedCourse = await _context.Results
                .Include(r => r.Assessment)
                .AnyAsync(r => r.UserId == userId && r.Assessment.CourseId == resultDto.CourseId);

            if (hasAlreadyAttemptedCourse)
                return BadRequest("You have already attempted an assessment for this course.");

            var result = new Result
            {
                ResultId = Guid.NewGuid(),
                AssessmentId = resultDto.AssessmentId,
                UserId = userId,
                AttemptDate = DateTime.UtcNow,
                Score = resultDto.Score,
                SelectedOptionsJson = System.Text.Json.JsonSerializer.Serialize(resultDto.SelectedOptions)
            };

            _context.Results.Add(result);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Result submitted successfully." });
        }



        [HttpGet("results/{userId}")]
        public async Task<IActionResult> GetUserResults(Guid userId)
        {
            var results = await _context.Results
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.AttemptDate)
                .ToListAsync();

            var groupedResults = results
                .GroupBy(r => r.AssessmentId)
                .Select(g => new
                {
                    AssessmentId = g.Key,
                    Attempts = g.Select(r => new
                    {
                        r.ResultId,
                        r.Score,
                        r.AttemptDate,
                        SelectedOptions = JsonConvert.DeserializeObject<List<object>>(r.SelectedOptionsJson)
                    }).ToList()
                });

            return Ok(groupedResults);
        }


    }

}