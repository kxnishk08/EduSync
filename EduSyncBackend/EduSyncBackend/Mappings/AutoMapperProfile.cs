using AutoMapper;
using EduSyncBackend.Models;
using EduSyncBackend.DTOs;

namespace EduSyncBackend.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<CreateCourseDto, Course>();

            CreateMap<Course, CourseDTO>()
                .ForMember(dest => dest.InstructorName,
                           opt => opt.MapFrom(src => src.Instructor.Name));

            CreateMap<CreateAssessmentDto, Assessment>();
            CreateMap<Assessment, AssessmentDTO>();

            CreateMap<Result, ResultDTO>();

            CreateMap<User, UserDTO>();
            CreateMap<SubmitResultDto, Result>()
    .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.StudentId))
    .ForMember(dest => dest.AssessmentId, opt => opt.MapFrom(src => src.AssessmentId));


        }
    }
}