import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name,
        email,
        role,
        password,
      });
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister} noValidate>
        <h2>Register</h2>
        <p className="subtitle">Create your account to start learning</p>

        {error && <div className="error-msg" role="alert">{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          autoFocus
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          className="select-field"
          aria-label="Select role"
        >
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="switch-link">
          Already have an account?{" "}
          <Link to="/login" className="link-primary">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
  