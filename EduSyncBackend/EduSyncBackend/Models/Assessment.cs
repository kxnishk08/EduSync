using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EduSyncBackend.Models
{
    public class Assessment
    {


        [Key]
        public Guid AssessmentId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        public string Title { get; set; }
        // [Required]
        public string? Questions { get; set; } // JSON stored as string

        public int MaxScore { get; set; }

        public Course Course { get; set; }
        public ICollection<Result> Results { get; set; } = new List<Result>();
    }
}