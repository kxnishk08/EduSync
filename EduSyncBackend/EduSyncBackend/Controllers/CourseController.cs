using AutoMapper;
using Azure.Storage.Blobs;
using EduSyncBackend.Data;
using EduSyncBackend.DTOs;
using EduSyncBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSyncBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;



        public CourseController(AppDbContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _context = context;
        }


        //  get request to fetch all courses
        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Assessments)
                .ToListAsync();

            return Ok(_mapper.Map<List<CourseDTO>>(courses));
        }

        [HttpGet("instructor/{instructorId}")]
        public async Task<IActionResult> GetCoursesByInstructor(Guid instructorId)
        {
            try
            {
                var courses = await _context.Courses
                    .Where(c => c.InstructorId == instructorId)
                    .Include(c => c.Instructor)
                    .Include(c => c.Assessments)
                    .ToListAsync();

                if (courses == null || courses.Count == 0)
                {
                    return NotFound("No courses found for the given instructor.");
                }

                return Ok(_mapper.Map<List<CourseDTO>>(courses));
            }
            catch (Exception ex)
            {
                // You can log the exception here
                return StatusCode(500, "An error occurred while retrieving the courses.");
            }
        }


        // post request to post course
        [HttpPost]
        [Authorize(Roles = "Instructor")]
        [RequestSizeLimit(52428800)] // 50 MB limit, adjust if needed
        public async Task<IActionResult> CreateCourse([FromForm] CreateCourseWithMediaDto dto)
        {
            var instructor = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == dto.InstructorId && u.Role == "Instructor");

            if (instructor == null)
                return BadRequest("Invalid Instructor");

            if (dto.Media == null || dto.Media.Length == 0)
                return BadRequest("Media file is required.");

            // Upload media to Azure Blob
            string blobUrl;
            try
            {
                var containerClient = new BlobContainerClient(
                    _configuration["AzureBlob:ConnectionString"],
                    _configuration["AzureBlob:ContainerName"]);

                await containerClient.CreateIfNotExistsAsync();
                var blobClient = containerClient.GetBlobClient(Guid.NewGuid() + Path.GetExtension(dto.Media.FileName));

                using (var stream = dto.Media.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, overwrite: true);
                }

                blobUrl = blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "File upload failed: " + ex.Message);
            }

            // Save course to DB
            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                InstructorId = dto.InstructorId,
                MediaUrl = blobUrl
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllCourses), new { id = course.CourseId }, course);
        }

    }
}