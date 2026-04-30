import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Layout.css";
import "./css/Sidebar.css";
import "./css/modern-theme.css"; // use the exact file name you actually have
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;