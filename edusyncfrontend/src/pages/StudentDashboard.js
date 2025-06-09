import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userdata = JSON.parse(storedUser);
  // console.log(userdata);

  const actions = [
    {
      title: "📚 View Enrolled Courses",
      desc: "View   enrolled courses.",
      path: "/student/enrolled-courses",
    },
    {
      title: "📝 Assessments",
      desc: "Attempt Quiz",
      path: "/student/all-assessments",
    },
    {
      title: "📝 View Quiz Results",
      desc: "View Quiz Result",
      path: "/student/ViewAssessmentResults",
    },
    {
      title: "📚 Explore New Courses",
      desc: "Explore and Browse new  courses.",
      path: "/student/explore-courses",
    },
  ];

  return (
    <div className="student-dashboard">
      <div className="action-grid">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="card clickable"
            onClick={() => navigate(action.path)}
          >
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
