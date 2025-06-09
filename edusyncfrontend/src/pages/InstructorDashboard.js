
import { useNavigate } from 'react-router-dom';
import './InstructorDashboard.css';
import '../App.css'

const InstructorDashboard = () => {
  const navigate = useNavigate();
   const storedUser = localStorage.getItem('user');
  const userdata=JSON.parse(storedUser)

  const actions = [
     { title: '📤 Upload New Course', desc: 'Manage your course uploads.', path: '/instructor/courses' },
  

    { title: '📈 View Quiz Performance', desc: 'Review quiz stats & performance.', path: '/instructor/quiz-performance' },

    { title: '📈 View My Courses', desc: 'View My Courses.', path: '/instructor/my-courses' },

   
  
  ];

  return (
    <div className="instructor-dashboard ">
    
      <div className="action-grid ">
        {actions.map((action, idx) => (
          <div key={idx} className="card clickable " onClick={() => navigate(action.path)}>
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorDashboard;
