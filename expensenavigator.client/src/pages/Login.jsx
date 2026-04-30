import React, { useState } from "react";
import { login, register } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../css/LoginModern.css";

function LoginModern({ onLoginSuccess }) {
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const resetForm = () => {
        setForm({ username: "", email: "", password: "" });
        setConfirmPassword("");
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
            const response = await login({
                username: form.username,
                password: form.password,
            });

            onLoginSuccess(response.data.token, response.data.userId);
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

        if (form.password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await register({
                username: form.username,
                email: form.email,
                password: form.password,
            });

            setSuccess("Account created successfully 🎉");

            setTimeout(() => {
                resetForm();
                setIsSignUp(false);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-layout">
            <div className="login-wrapper">
                <div className={`loginPage ${isSignUp ? "active" : ""}`}>

                    {/* ================= SIGN UP ================= */}
                    <div className="form-container sign-up">
                        <form onSubmit={handleRegister}>
                            <h1>Create Account</h1>

                            {/* Username */}
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="password-wrapper">
                                <input
                                    type={showSignUpPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={() =>
                                        setShowSignUpPassword(!showSignUpPassword)
                                    }
                                >
                                    {showSignUpPassword ? "🙈" : "👁"}
                                </span>
                            </div>

                            {/* Confirm Password */}
                            <div className="input-wrapper">
                                <input
                                    type={showSignUpPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && <p className="error-text">{error}</p>}
                            {success && <p className="success-text">{success}</p>}

                            <button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Sign Up"}
                            </button>
                        </form>
                    </div>

                    {/* ================= SIGN IN ================= */}
                    <div className="form-container sign-in">
                        <form onSubmit={handleLogin}>
                            <h1>Sign In</h1>

                            {/* Username */}
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="password-wrapper">
                                <input
                                    type={showSignInPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={() =>
                                        setShowSignInPassword(!showSignInPassword)
                                    }
                                >
                                    {showSignInPassword ? "🙈" : "👁"}
                                </span>
                            </div>

                            {error && <p className="error-text">{error}</p>}
                            {success && <p className="success-text">{success}</p>}

                            <p
                                className="forgot-link"
                                onClick={() =>
                                    navigate("/forgot-password")
                                }
                            >
                                Forgot Password?
                            </p>

                            <button type="submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>

                    {/* ================= TOGGLE ================= */}
                    <div className="toggle-container">
                        <div className="toggle">
                            <div className="toggle-panel toggle-left">
                                <h1>Welcome Back!</h1>
                                <p>Enter your details to continue</p>
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
                                <h1>Hello!</h1>
                                <p>Register to get started</p>
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
        </div>
    );
}

export default LoginModern;