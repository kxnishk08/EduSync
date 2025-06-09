import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; // Confirm the path

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'Student') {
        navigate('/student-dashboard');
      } else if (loggedInUser?.role === 'Instructor') {
        navigate('/instructor-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to continue learning</p>

        {error && <div className="error-msg" role="alert">{error}</div>}

        <label htmlFor="email" className="input-label">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input-field"
          disabled={loading}
        />

        <label htmlFor="password" className="input-label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input-field"
          disabled={loading}
        />

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch-link">
          Don't have an account? <Link to="/register" className="link-primary">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
