
import  { useEffect, useState } from "react";
import API from '../../services/api'; // Use your API helper for consistent baseURL, headers

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await API.get("/student/enrolled-courses");
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) return <p>Loading your enrolled courses...</p>;

  return (
    <div className="container mt-1">
      <h2>📚 My Courses</h2>
      <p>
        Here you can find all the courses you have enrolled in.  
        Explore your learning progress, review course details, and keep track of your educational journey in one place.
      </p>

      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses yet. Visit Explore Courses to get started.</p>
      ) : (
        <div className="row">
          {enrolledCourses.map((course) => (
            <div key={course.courseId} className="col-md-3 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>{course.title}</h5>
                  <p>{course.description}</p>
                  <p><strong>Instructor:</strong> {course.instructorName || "Unknown"}</p>

                  {course.mediaUrl ? (
                    <a
                      href={course.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      View Content
                    </a>
                  ) : (
                    <p className="text-muted">Content not available</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
