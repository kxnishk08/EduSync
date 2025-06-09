import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QuizPerformance = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        return null;
      }
    };

    const decoded = parseJwt(token);
    const instructorId = decoded
      ? decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
      : null;

    if (!instructorId) return;

    const fetchStudents = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(
          `${baseUrl}/api/Results/enrolled-students/by-instructor/${instructorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudents(res.data);

        // console.log(students)
        // console.log(res.data)
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };

    fetchStudents();
  }, []);

  const handleViewResult = async (courseId, userId) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      const res = await axios.get(`${baseUrl}/api/Assessment/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const assessmentId = res.data.assessmentId;
      // console.log("ass id quiz performance:", assessmentId);
      // console.log("user id quiz performance:", userId);

        if (assessmentId) {
          // ✅ Navigate with both assessmentId and userId
          navigate(`/student/ViewResult/${assessmentId}/${userId}`);
        } else {
          alert("No assessment found for this course.");
        }
    } catch (error) {
      console.error("Error fetching assessmentId", error);
      alert("Unable to get assessment for this course.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>📊 Student Quiz Submissions</h2>
      <p>
        View the students who have submitted quizzes for your courses. Monitor
        participation and track submissions.
      </p>

      {students.length === 0 ? (
        <p>No students have submitted quizzes yet.</p>
      ) : (
        <div className="row">
          {students.map((s) => (
            <div key={s.userId + s.courseId} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                
                <div className="card-body">
                  <h5>Name : {s.name}</h5>
                  <h6>Course : {s.courseTitle}</h6>
                  <h6>
                    Enrolled On : {new Date(s.enrolledOn).toLocaleString()}
                  </h6>
                  <br />
          
                  
                  <button
                    className="btn btn-primary"
                    disabled={!s.hasAttemptedQuiz}
                    onClick={() => handleViewResult(s.courseId, s.userId)}
                  >
                    {s.hasAttemptedQuiz ? "View Result" : "Quiz Not Attempted"}
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

export default QuizPerformance;
