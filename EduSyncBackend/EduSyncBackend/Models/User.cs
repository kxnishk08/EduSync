using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduSyncBackend.Models
{
    public class User
    {

        [Key]
        public Guid UserId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Role { get; set; } // "Student" or "Instructor"

        [Required]
        public string PasswordHash { get; set; }

        // Navigation properties:
        public ICollection<Course> CoursesTaught { get; set; }  // for Instructor courses
        public ICollection<Enrollment> Enrollments { get; set; }  // for student's enrollments
        //public ICollection<Result> Results { get; set; }          // for user's assessment results

    }
}