using System;

namespace EduSyncBackend.DTOs
{

    public class ResultDTO
    {
        public Guid ResultId { get; set; }
        public Guid UserId { get; set; }

        public Guid CourseId { get; set; }

        public int Score { get; set; }
        public DateTime AttemptDate { get; set; }

        public Guid AssessmentId { get; set; }
        public List<SelectedOptionDTO> SelectedOptions { get; set; }

    }
}