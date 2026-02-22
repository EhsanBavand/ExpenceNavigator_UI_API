import React, { useState } from "react";
import { login, register } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../CSS/LoginModern.css";

function LoginModern() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
    });
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await login({
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setSuccess("Account created successfully 🎉 Redirecting to login...");

      setTimeout(() => {
        resetForm();
        setIsSignUp(false); // switch to login
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`loginPage ${isSignUp ? "active" : ""}`}>
        {/* ========== SIGN UP ========== */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* ========== SIGN IN ========== */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* ========== TOGGLE ========== */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all site features</p>
              <button
                className="hidden"
                onClick={() => {
                  resetForm();
                  setIsSignUp(false);
                }}
              >
                Sign In
              </button>
            </div>

            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>
                Register with your personal details to use all site features
              </p>
              <button
                className="hidden"
                onClick={() => {
                  resetForm();
                  setIsSignUp(true);
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModern;
