using AutoMapper;
using EduSyncBackend.Data;
using EduSyncBackend.DTOs;
using EduSyncBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Security.Claims;
using System.Text.Json;

namespace EduSyncBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ResultsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResultsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("by-user/{userId}/assessment/{assessmentId}")]
        public async Task<IActionResult> GetResultByUserAndAssessment(Guid userId, Guid assessmentId)
        {
            var result = await _context.Results
                .FirstOrDefaultAsync(r => r.UserId == userId && r.AssessmentId == assessmentId);

            if (result == null) return NotFound();

            var assessment = await _context.Assessments.FirstOrDefaultAsync(a => a.AssessmentId == assessmentId);

            // Deserialize with new QuizQuestionDTO structure
            var questionList = JsonConvert.DeserializeObject<List<QuizQuestionDTO>>(assessment.Questions ?? "[]");
            var selectedAnswers = JsonConvert.DeserializeObject<List<SelectedAnswerDTO>>(result.SelectedOptionsJson ?? "[]");

            int correct = 0, incorrect = 0, unattempted = 0;

            foreach (var question in questionList)
            {
                var selected = selectedAnswers.FirstOrDefault(s => s.QuestionId == question.QuestionId);
                question.SelectedOption = selected?.SelectedOption ?? "Unattempted";

                if (question.SelectedOption == "Unattempted")
                {
                    unattempted++;
                }
                else if (question.SelectedOption == question.CorrectAnswer)  // use CorrectAnswer here
                {
                    correct++;
                }
                else
                {
                    incorrect++;
                }
            }

            var accuracy = questionList.Count > 0 ? ((double)correct / questionList.Count) * 100 : 0;

            return Ok(new
            {
                result.AssessmentId,
                result.Score,
                TotalQuestions = questionList.Count,
                Correct = correct,
                Incorrect = incorrect,
                Unattempted = unattempted,
                Accuracy = Math.Round(accuracy, 2),
                Questions = questionList
            });
        }



        [HttpGet("enrolled-students/by-instructor/{instructorId}")]
        public async Task<IActionResult> GetEnrolledStudentsByInstructor(Guid instructorId)
        {
            // 1. Instructor ke courses laao
            var courses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => new { c.CourseId, c.Title })
                .ToListAsync();

            var courseIds = courses.Select(c => c.CourseId).ToList();

            // 2. In assessments table, courses ke assessments laao
            var assessments = await _context.Assessments
                .Where(a => courseIds.Contains(a.CourseId))
                .Select(a => new { a.AssessmentId, a.CourseId })
                .ToListAsync();

            // 3. Enrollments with User details
            var enrolledStudents = await _context.Enrollments
                .Where(e => courseIds.Contains(e.CourseId))
                .Include(e => e.User)
                .ToListAsync();

            // 4. Ab har enrolled student ke liye HasAttemptedQuiz check karo
            var resultData = enrolledStudents.Select(e =>
            {
                var course = courses.FirstOrDefault(c => c.CourseId == e.CourseId);
                var assessment = assessments.FirstOrDefault(a => a.CourseId == e.CourseId);

                bool hasAttempted = false;
                if (assessment != null)
                {
                    hasAttempted = _context.Results.Any(r => r.UserId == e.UserId && r.AssessmentId == assessment.AssessmentId);
                }

                return new
                {
                    e.User.UserId,
                    e.User.Name,
                    e.User.Email,
                    e.EnrolledOn,
                    e.CourseId,
                    CourseTitle = course?.Title,
                    HasAttemptedQuiz = hasAttempted
                };
            }).ToList();

            return Ok(resultData);
        }




        // Get all results for instructor view
        [HttpGet("all")]
        public async Task<IActionResult> GetAllResults()
        {
            var results = await _context.Results
                .Include(r => r.Assessment)
                .Include(r => r.User)
                .ToListAsync();

            return Ok(results);
        }
    }

}