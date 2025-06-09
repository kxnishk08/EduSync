using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EduSyncBackend.Models
{
    public class Result
    {

        public Guid ResultId { get; set; }
        public Guid AssessmentId { get; set; }
        public Guid UserId { get; set; }
        public int Score { get; set; }
        public DateTime AttemptDate { get; set; }
        public string SelectedOptionsJson { get; set; } // JSON: [{ QuestionId, SelectedOption }]

        public User User { get; set; }
        public Assessment Assessment { get; set; }


    }
}