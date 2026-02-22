import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import IncomePage from "../pages/IncomePage";
import ExpensesPage from "../pages/ExpensesPage";
import SavingPage from "../pages/SavingPage"; // exact match

import Layout from "../components/Layout";

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logged out");
    localStorage.removeItem("token");
    navigate("/login"); // smooth client-side navigation
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Protected Routes wrapped in Layout */}
      <Route
        path="/dashboard/*"
        element={
          <Layout onLogout={handleLogout}>
            <DashboardPage />
          </Layout>
        }
      />

      <Route
        path="/income"
        element={
          <Layout onLogout={handleLogout}>
            <IncomePage />
          </Layout>
        }
      />
      <Route
        path="/expenses"
        element={
          <Layout onLogout={handleLogout}>
            <ExpensesPage />
          </Layout>
        }
      />
      <Route
        path="/saving"
        element={
          <Layout onLogout={handleLogout}>
            <SavingPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
