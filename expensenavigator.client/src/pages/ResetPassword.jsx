import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../CSS/LoginModern.css";
function ResetPasswordModern() {
    const query = new URLSearchParams(useLocation().search);
    const email = query.get("email");
    const token = query.get("token");
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await resetPassword({
                email,
                token,
                newPassword: password
            });
            setMessage("Password reset successful 🎉");
            setTimeout(() => {
                navigate("/")
            }, 1500)
        } catch (err) {
            setError(err.response?.data?.message || "Reset failed")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Create New Password</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
                {message && <p className="success-text">{message}</p>}
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    )
}
export default ResetPasswordModern;