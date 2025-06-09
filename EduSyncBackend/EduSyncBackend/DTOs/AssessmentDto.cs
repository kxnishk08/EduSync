using System;
using System.Collections.Generic;

namespace EduSyncBackend.DTOs
{
    public class AssessmentDTO
    {

        public Guid AssessmentId { get; set; }
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public int MaxScore { get; set; }
        public List<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();
    }
}