namespace EduSyncBackend.DTOs
{
    public class SelectedAnswerDTO
    {
        public Guid QuestionId { get; set; }
        public string SelectedOption { get; set; }
    }
}