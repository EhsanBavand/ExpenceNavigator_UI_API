import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import IncomePage from "../pages/IncomePage";
import ExpensesPage from "../pages/ExpensesPage";
import SavingPage from "../pages/SavingPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Layout from "../components/Layout";
import ExpensesPage2 from "../pages/ExpensePage2";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
};

/* ================= PUBLIC ROUTE (Prevent login when logged in) ================= */
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    return (
        <Routes>
            {/* Default */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <Layout onLogout={handleLogout}>
                            <DashboardPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/income"
                element={
                    <ProtectedRoute>
                        <Layout onLogout={handleLogout}>
                            <IncomePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <Layout onLogout={handleLogout}>
                            <ExpensesPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/*<Route*/}
            {/*    path="/expenses2"*/}
            {/*    element={*/}
            {/*        <ProtectedRoute>*/}
            {/*            <Layout onLogout={handleLogout}>*/}
            {/*                <ExpensesPage2 />*/}
            {/*            </Layout>*/}
            {/*        </ProtectedRoute>*/}
            {/*    }*/}
            {/*/>*/}

            <Route
                path="/saving"
                element={
                    <ProtectedRoute>
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