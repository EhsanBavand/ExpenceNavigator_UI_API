import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// AUTH & APP
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import IncomePage from "../pages/IncomePage";
import ExpensesPage from "../pages/ExpensesPage";
import SavingPage from "../pages/SavingPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Layout from "../components/Layout";

// PUBLIC PAGES
import Home from "../pages/Home";
import Services from "../pages/Services";
import ExpenseNavigator from "../pages/MyApp";
import Contact from "../pages/Contact";
import PublicLayout from "../components/PublicLayout";

// ROUTE GUARDS
const ProtectedRoute = ({ isAuth, children }) =>
    isAuth ? children : <Navigate to="/login" replace />;

const PublicRoute = ({ isAuth, children }) =>
    isAuth ? <Navigate to="/dashboard" replace /> : children;

const AppRoutes = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("token")
    );

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

            {/* ✅ PUBLIC WEBSITE + AUTH (WITH NAVBAR & FOOTER) */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/my-app" element={<ExpenseNavigator />} />
                <Route path="/contact" element={<Contact />} />

                {/* ✅ LOGIN & PASSWORD (NOW WITH NAVBAR & FOOTER) */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute isAuth={isAuthenticated}>
                            <LoginPage onLoginSuccess={handleLoginSuccess} />
                        </PublicRoute>
                    }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* ✅ PROTECTED APP (SIDEBAR LAYOUT) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isAuth={isAuthenticated}>
                        <Layout onLogout={handleLogout}>
                            <DashboardPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/income"
                element={
                    <ProtectedRoute isAuth={isAuthenticated}>
                        <Layout onLogout={handleLogout}>
                            <IncomePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/expenses"
                element={
                    <ProtectedRoute isAuth={isAuthenticated}>
                        <Layout onLogout={handleLogout}>
                            <ExpensesPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/saving"
                element={
                    <ProtectedRoute isAuth={isAuthenticated}>
                        <Layout onLogout={handleLogout}>
                            <SavingPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
};

export default AppRoutes;

