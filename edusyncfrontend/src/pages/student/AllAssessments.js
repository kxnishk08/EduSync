import  { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AllAssessments = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [attemptedCourseIds, setAttemptedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || null;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const userRole = getUserRole();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, attemptedRes] = await Promise.all([
          API.get("/student/enrolled-courses"),
          API.get("/student/attempted-courses"),
        ]);
        setEnrolledCourses(coursesRes.data);
        setAttemptedCourseIds(attemptedRes.data); // List of courseIds already attempted
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (userRole !== "Student") {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger">⚠️ Access Denied: This section is only for students.</h4>
      </div>
    );
  }

  if (loading) return <p>Loading quizzes for your enrolled courses...</p>;

  return (
    <div className="container mt-1">
      <h2>📝 Available Quizzes</h2>
      <p>
        Attempt quizzes for the courses you have enrolled in. Test your knowledge and track your performance.
      </p>

      {enrolledCourses.length === 0 ? (
        <p>You are not enrolled in any courses. Enroll to access assessments.</p>
      ) : (
        <div className="row">
          {enrolledCourses.map((course) => {
            const alreadyAttempted = attemptedCourseIds.includes(course.courseId);
            return (
              <div key={course.courseId} className="col-md-3 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5>{course.title}</h5>
                    <p>{course.description}</p>
                    <p><strong>Instructor:</strong> {course.instructorName || "Unknown"}</p>
                    <button
                      className="btn btn-primary"
                      disabled={alreadyAttempted}
                      onClick={() => !alreadyAttempted && navigate(`/attempt/${course.courseId}`)}
                    >
                      {alreadyAttempted ? "Already Attempted" : "Attempt Quiz"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllAssessments;
