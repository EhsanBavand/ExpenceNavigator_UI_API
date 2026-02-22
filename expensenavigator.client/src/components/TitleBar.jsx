import React from "react";

const TitleBar = ({ onLogout, onToggleSidebar }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
            <button
                className="btn btn-outline-light d-lg-none me-3"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
            >
                <i className="bi bi-list"></i>
            </button>

            <span className="navbar-brand">Expense Navigator</span>

            <div className="ms-auto">
                <div className="dropdown">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="bi bi-person-circle me-1"></i> Account
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    console.log("Logout clicked"); // Debug log
                                    if (onLogout) onLogout();
                                }}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default TitleBar;
