import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import IncomePage from "../pages/IncomePage";
import ExpensesPage from "../pages/ExpensesPage";
//import ExpensesPage2 from "../pages/ExpensesPage2";
import SavingPage from "../pages/SavingPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Layout from "../components/Layout";

const ProtectedRoute = ({ isAuth, children }) => isAuth ? children : <Navigate to="/login" replace />;
const PublicRoute = ({ isAuth, children }) => isAuth ? <Navigate to="/dashboard" replace /> : children;

const AppRoutes = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    const handleLoginSuccess = (token, userId) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        setIsAuthenticated(true);
        navigate("/dashboard", { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
    };

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="/login"
                element={
                    <PublicRoute isAuth={isAuthenticated}>
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    </PublicRoute>
                }
            />            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute isAuth={isAuthenticated}><Layout onLogout={handleLogout}><DashboardPage /></Layout></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute isAuth={isAuthenticated}><Layout onLogout={handleLogout}><IncomePage /></Layout></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute isAuth={isAuthenticated}><Layout onLogout={handleLogout}><ExpensesPage /></Layout></ProtectedRoute>} />
            {/*<Route path="/expenses2" element={<ProtectedRoute isAuth={isAuthenticated}><Layout onLogout={handleLogout}><ExpensesPage2 /></Layout></ProtectedRoute>} />*/}
            <Route path="/saving" element={<ProtectedRoute isAuth={isAuthenticated}><Layout onLogout={handleLogout}><SavingPage /></Layout></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;