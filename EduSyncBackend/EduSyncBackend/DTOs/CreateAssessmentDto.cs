namespace EduSyncBackend.DTOs
{
    public class CreateAssessmentDto
    {

        public Guid CourseId { get; set; }
        public string? Title { get; set; }
        public int DurationMinutes { get; set; }
    }
}