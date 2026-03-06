import React, { useState } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../CSS/LoginModern.css";
function ForgotPasswordModern() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {

            await forgotPassword(email);

            setMessage("If this email exists, a reset link has been sent.");

        } catch (err) {

            setError(err.response?.data?.message || "Request failed");

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <p className="subtitle">
                    Enter your email and we will send you a reset link
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                {message && <p className="success-text">{message}</p>}
                {error && <p className="error-text">{error}</p>}

                <p
                    className="back-link"
                    onClick={() => navigate("/")}>
                    Back to Login
                </p>
            </div>
        </div>
    )
}
export default ForgotPasswordModern;