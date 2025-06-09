namespace EduSyncBackend.DTOs
{
    public class SubmitResultDto
    {
        public Guid AssessmentId { get; set; }
        public int Score { get; set; }
        public Guid StudentId { get; set; }

        public List<AnswerDTO> Answers { get; set; }
    }
}