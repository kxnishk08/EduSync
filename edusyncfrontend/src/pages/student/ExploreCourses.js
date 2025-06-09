
import  { useEffect, useState } from "react";
import API from '../../services/api';

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/Course");
        console.log("Fetched courses:", res.data);
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    const fetchEnrolledCourses = async () => {    
      try {
        const res = await API.get("/student/enrolled-courses");
        const ids = res.data.map(course => course.courseId);
        setEnrolledCourseIds(ids);
      } catch (error) {
        console.error("Error fetching enrolled courses", error);
      }
    };

    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    if (!courseId) {
    alert("Course ID is invalid. Cannot enroll.");
    return;
  }
    try {
      // Important: POST expects a JSON body, so send an object, not raw GUID
      await API.post("/student/enroll", { courseId });
      alert("Enrolled successfully!");
      setEnrolledCourseIds(prev => [...prev, courseId]);
    } catch (error) {
      alert(error?.response?.data || "Failed to enroll.");
    }
  };

  return (
    <div className="container mt-1">
      <h2>Explore Courses</h2>
      <p>Browse all available courses below. Click "Enroll" to start learning.</p>

      {courses.length === 0 ? (
        <p>No courses available at the moment.</p>
      ) : (
        <div className="row">
          {courses.map((course) => (
            <div key={course.courseId} className="col-md-3 mb-3 ">
              <div className="card  shadow-sm ">
                <div className="card-body">
                  <h5>{course.title}</h5>
                  <p>{course.description}</p>
                  <p><strong>Instructor:</strong> {course.instructorName }</p>
                  
                  <button
                    className="btn btn-primary"
                    disabled={enrolledCourseIds.includes(course.courseId)}
                    onClick={() => handleEnroll(course.courseId)}
                  >
                    {enrolledCourseIds.includes(course.courseId) ? "Enrolled" : "Enroll"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCourses;

