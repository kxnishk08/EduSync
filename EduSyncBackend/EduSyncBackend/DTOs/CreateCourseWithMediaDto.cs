namespace EduSyncBackend.DTOs
{
    public class CreateCourseWithMediaDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid InstructorId { get; set; }
        public IFormFile Media { get; set; }
    }
}