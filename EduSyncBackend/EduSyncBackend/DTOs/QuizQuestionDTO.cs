namespace EduSyncBackend.DTOs
{
    public class QuizQuestionDTO
    {

        public Guid QuestionId { get; set; }
        public string QuestionText { get; set; }  // changed from 'Question'
        public List<string> Options { get; set; }
        public string CorrectAnswer { get; set; }  // changed from 'CorrectOption'

        public string SelectedOption { get; set; } // for storing user's answer (not in DB)
        public bool IsCorrect => SelectedOption != "Unattempted" && SelectedOption == CorrectAnswer;
    }
}