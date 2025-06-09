using System;
using System.Collections.Generic;


namespace EduSyncBackend.DTOs
{
    public class CourseDTO
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }

        public string Description { get; set; }

        public string InstructorName { get; set; }
        public string MediaUrl { get; set; }

    }
}