namespace EduSyncBackend.DTOs
{
    public class BlobQuestionDTO
    {
        public Guid QuestionId { get; set; }
        public string QuestionText { get; set; }
        public List<string> Options { get; set; }
        public string CorrectAnswer { get; set; }
    }
}