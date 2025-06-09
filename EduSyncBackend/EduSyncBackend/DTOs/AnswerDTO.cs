namespace EduSyncBackend.DTOs
{
    public class AnswerDTO
    {
        public Guid QuestionId { get; set; }
        public string SelectedOption { get; set; }
        public bool IsCorrect { get; set; }
        public int MarksObtained { get; set; }
    }
}