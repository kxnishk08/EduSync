import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import "../App.css";

// Student
import StudentDashboard from "../pages/StudentDashboard";
import ViewAssessmentResults from "../pages/student/ViewAssessmentResults";
import EnrolledCourses from "../pages/student/EnrolledCourses";
import ExploreCourses from "../pages/student/ExploreCourses";
import AllAssessments from "../pages/student/AllAssessments";
import AttemptQuiz from "../pages/student/AttemptQuiz";
import ViewResult from "../pages/student/ViewResult";

//Instructor
import InstructorDashboard from "../pages/InstructorDashboard";
import UploadCourses from "../pages/instructor/UploadCourses";
import QuizPerformance from "../pages/instructor/QuizPerformance";
import ViewMyCourses from "../pages/instructor/ViewMyCourses";

import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => (
  <div className="route-wrapper hero">
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="Student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/enrolled-courses"
        element={
          <ProtectedRoute role="Student">
            <EnrolledCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/explore-courses"
        element={
          <ProtectedRoute role="Student">
            <ExploreCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/all-assessments"
        element={
          <ProtectedRoute role="Student">
            <AllAssessments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attempt/:courseId"
        element={
          <ProtectedRoute role="Student">
            <AttemptQuiz />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/ViewResult"
        element={
          <ProtectedRoute role="Student">{<ViewResult />}</ProtectedRoute>
        }
      />

      {/* ye h final jo kaam kr rhi h student ke liye */}
      <Route
        path="/student/ViewResult/:assessmentId"
        element={
          <ProtectedRoute role="Student">{<ViewResult />}</ProtectedRoute>
        }
      />

      {/* ye h final jo kaam kr rhi h instructor ke liye */}
      <Route
        path="/student/ViewResult/:assessmentId/:userId"
        element={<ViewResult />}
      />

      <Route
        path="/student/ViewAssessmentResults"
        element={
          <ProtectedRoute role="Student">
            {<ViewAssessmentResults />}
          </ProtectedRoute>
        }
      />

      <Route path="/result/:assessmentId" element={<ViewResult />} />
      <Route path="/result/:assessmentId/:studentId" element={<ViewResult />} />

      {/* Instructor dashboard =============================================================================*/}
      <Route
        path="/instructor-dashboard"
        element={
          <ProtectedRoute role="Instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/instructor/courses" element={<UploadCourses />} />

      <Route path="/instructor/my-courses" element={<ViewMyCourses />} />

      <Route
        path="/instructor/quiz-performance"
        element={<QuizPerformance />}
      />

      {/* Redirect any unknown route to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default AppRoutes;
