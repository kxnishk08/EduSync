
import  { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import API from '../../services/api';

const UploadCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const storedUser = localStorage.getItem('user');
  const userdata = storedUser ? JSON.parse(storedUser) : null;
  const instructorId = userdata?.userId || userdata?.id || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    if (!title || !description || !media) {
      setError('All fields including media file are required.');
      setLoading(false);
      return;
    }

    if (!instructorId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('instructorId', instructorId);
      formData.append('media', media);
//================ Post api=======================
      await API.post('/Course', formData);
      setSuccess('Course uploaded successfully!');
      setTitle('');
      setDescription('');
      setMedia(null);
    } catch (err) {
      console.error(err);
      setError('Course upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'Instructor') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Access denied. Only instructors can upload courses.</Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Success alert fixed at top center */}
      {success && (
        <Alert
          variant="success"
          className="text-center"
          style={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            width: 'fit-content',
            minWidth: '300px',
          }}
          onClose={() => setSuccess('')}
          dismissible
        >
          {success}
        </Alert>
      )}

      <Container className="py-5">
        <div
          className="card shadow-sm new-course-main border-0 p-4 mx-auto"
          style={{ maxWidth: '650px' }}
        >
          <h3 className="text-center text-white fw-semibold mb-4">Upload New Course</h3>

          {/* Error alert inside card as usual */}
          {error && (
            <Alert variant="danger" className="text-center" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label className="fw-bold">Course Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label className="fw-bold">Course Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter a brief description of the course"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="media">
              <Form.Label className="fw-bold">Upload Course Media</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} required disabled={loading} />
              <Form.Text className="text-white fw-bold">
                Accepted formats: MP4, PDF, DOCX, etc.
              </Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    Uploading... <Spinner animation="border" size="sm" />
                  </>
                ) : (
                  'Upload Course'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default UploadCourses;
