import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ViewAssessmentResults = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [resultsByCourse, setResultsByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Extract userId from token once component loads
  useEffect(() => {
    const extractUserId = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        return (
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ] ||
          decoded.sub ||
          null
        );
      } catch (err) {
        console.error("Invalid token:", err);
        return null;
      }
    };

    const uid = extractUserId();
    if (!uid) {
      alert("User not logged in. Please login again.");
      navigate("/login");
    } else {
      setUserId(uid);
    }
  }, [navigate]);

  // Fetch enrolled courses and quiz results after userId is available
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const coursesRes = await API.get("/student/enrolled-courses");
        const courses = coursesRes.data || [];
        setEnrolledCourses(courses);

        const resultsMap = {};
        for (const course of courses) {
          const res = await API.get(`/student/quiz-results/${course.courseId}`);
          resultsMap[course.courseId] = res.data || [];
        }

        console.log("Fetched resultsMap:", resultsMap);

        setResultsByCourse(resultsMap);
      } catch (error) {
        console.error("Error fetching courses or results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleViewResult = (assessmentId) => {
    navigate(`/student/ViewResult/${assessmentId}`);
  };

  //  console.log("Courses enrolled fetched:", enrolledCourses);
  // console.log("Results by course:", resultsByCourse);

  if (loading) return <p>Loading your quiz results...</p>;

  if (enrolledCourses.length === 0) {
    return <p>You have not enrolled in any courses yet.</p>;
  }

  return (
    <div className="container mt-4">
      <h2>📋 My Quiz Attempts</h2>
      <p>Click to view your quiz results for attempted quizzes only.</p>

      <div className="row">
        {enrolledCourses
          .filter((course) => {
            const attempts = resultsByCourse[course.courseId] || [];
            // Check if attempts contain at least one submitted attempt (non-null score and resultId)
            return attempts.some(
              (attempt) => attempt.score !== null && attempt.resultId !== null
            );
          })
          .map((course) => {
            const attempts = resultsByCourse[course.courseId];
            const firstAttempt = attempts[0];

            return (
              <div key={course.courseId} className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text">{course.description}</p>
                    <p>
                      <strong>Instructor:</strong>{" "}
                      {course.instructorName || "Unknown"}
                    </p>

                    <div className="mt-auto">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleViewResult(firstAttempt.assessmentId)
                        }
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ViewAssessmentResults;
