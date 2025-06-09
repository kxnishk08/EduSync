import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    setIsDashboard(
      location.pathname === '/instructor-dashboard' ||
      location.pathname === '/student-dashboard'
    );
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar 
      expand="lg" 
      fixed="top" 
      style={{ backgroundColor: '#1a237e', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      variant="dark"
      className="custom-navbar"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          EduSync
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && !isDashboard && (
              <>
                <Nav.Link
                  as={Link}
                  to={
                    user.role === 'Student'
                      ? '/student-dashboard'
                      : '/instructor-dashboard'
                  }
                  className="nav-link-custom"
                >
                  {user.role === 'Student' ? 'Student Dashboard' : 'Instructor Dashboard'}
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to={
                    user.role === 'Student'
                      ? '/student/enrolled-courses'
                      : '/instructor/courses'
                  }
                  className="nav-link-custom"
                >
                  {user.role === 'Student' ? 'Enrolled Courses' : 'Upload Course'}
                </Nav.Link>

                {user.role === 'Student' && (
                  <Nav.Link as={Link} to="student/all-assessments" className="nav-link-custom">
                    Assessments
                  </Nav.Link>
                )}

                <Nav.Link
                  as={Link}
                  to={
                    user.role === 'Student'
                      ? '/student/ViewAssessmentResults'
                      : '/instructor/quiz-performance'
                  }
                  className="nav-link-custom"
                >
                  {user.role === 'Student' ? 'Quiz Results' : 'Student Performance'}
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to={
                    user.role === 'Student'
                      ? '/student/explore-courses'
                      : '/instructor/my-courses'
                  }
                  className="nav-link-custom"
                >
                  {user.role === 'Student' ? 'Explore Courses' : 'My Courses'}
                </Nav.Link>
              </>
            )}

            {user && isDashboard && (
              <Nav.Link
                as={Link}
                to={
                  user.role === 'Student'
                    ? '/student-dashboard'
                    : '/instructor-dashboard'
                }
                className="nav-link-custom"
              >
                {user.role === 'Student' ? 'Student Dashboard' : 'Instructor Dashboard'}
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="navbar-text" style={{ color: '#fbc02d' }}>
                  Good to see you!, {user.name}
                </span>
                <Button 
                  variant="outline-warning" 
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline-warning"
                  as={Link}
                  to="/login"
                  className="me-2"
                >
                  Login
                </Button>
                <Button variant="outline-warning" as={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
