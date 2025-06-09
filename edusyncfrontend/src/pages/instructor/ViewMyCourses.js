import  { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import API from '../../services/api';

const ViewMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();

  const storedUser = localStorage.getItem('user');
  const userdata = storedUser ? JSON.parse(storedUser) : null;
  const instructorId = userdata?.userId || userdata?.id || null;

  // console.log("user id 1 : ", userdata?.userId);

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      if (!instructorId) throw new Error("Instructor ID is missing");

      const response = await API.get(`/Course/instructor/${instructorId}`);
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching instructor courses:", err);

      // Check for 404 response
      if (err.response && err.response.status === 404) {
        setError("No courses uploaded yet.");
      } else {
        setError("Failed to load courses.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, [instructorId]);


  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Uploaded Courses</h2>

      {courses.length === 0 ? (
        <p className="text-muted">⚠ No course is uploaded by instructor yet.</p>
      ) : (
        <div className="row">
          {courses.map((course) => (
            <div key={course.courseId} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Course Name: {course.title}</h5>
                  <p className="card-text">Overview: {course.description}</p>
                  {course.mediaUrl ? (
                    <a
                      href={course.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      View Content
                    </a>
                  ) : (
                    <p className="text-muted">No Content available</p>
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

export default ViewMyCourses;
