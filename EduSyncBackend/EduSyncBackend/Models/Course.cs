using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EduSyncBackend.Models
{
    public class Course
    {

        [Key]
        public Guid CourseId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public Guid InstructorId { get; set; }

        public string MediaUrl { get; set; }

        // Navigation
        //  [ForeignKey("InstructorId")]
        public User Instructor { get; set; }


        public ICollection<Enrollment> Enrollments { get; set; }
        //public ICollection<Result> Results { get; set; }
        public ICollection<Assessment> Assessments { get; set; }
    }
}