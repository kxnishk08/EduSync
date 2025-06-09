using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSyncBackend.Models
{
    public class Enrollment
    {
        [Key]
        public Guid EnrollmentId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public Guid UserId { get; set; }
        [Required]
        public DateTime EnrolledOn { get; set; }

        // Navigation properties
        [ForeignKey("CourseId")]
        public Course Course { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}