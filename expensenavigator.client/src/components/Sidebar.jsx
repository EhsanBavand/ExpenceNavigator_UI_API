import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle, isDesktop }) => {
    const mobileState = isDesktop ? "" : isOpen ? "open" : "closed";

    const handleItemClick = () => {
        if (!isDesktop && onToggle) onToggle();
    };

    return (
        <>
            <aside className={`sidebar-root ${mobileState}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <h6 className="sidebar-brand">
                        <span className="brand-dot" />
                        Expense Navigator
                    </h6>

                    {!isDesktop && (
                        <button className="sidebar-close" onClick={onToggle} aria-label="Close sidebar">
                            <i className="bi bi-x-lg" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="sidebar-content">
                    <div className="sidebar-section">Main</div>
                    <ul className="sidebar-nav">
                        <li>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                onClick={handleItemClick}
                            >
                                <span className="sidebar-icon"><i className="bi bi-house-door-fill" /></span>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/income"
                                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                onClick={handleItemClick}
                            >
                                <span className="sidebar-icon"><i className="bi bi-cash-coin" /></span>
                                <span>Income</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/expenses"
                                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                onClick={handleItemClick}
                            >
                                <span className="sidebar-icon"><i className="bi bi-cart-check-fill" /></span>
                                <span>Expenses</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/expenses2"
                                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                onClick={handleItemClick}
                            >
                                <span className="sidebar-icon"><i className="bi bi-cart-check-fill" /></span>
                                <span>Expenses 2</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/saving"
                                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                onClick={handleItemClick}
                            >
                                <span className="sidebar-icon"><i className="bi bi-piggy-bank-fill" /></span>
                                <span>Savings</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">© {new Date().getFullYear()} Expense Navigator</div>
            </aside>

            {/* Mobile overlay */}
            {!isDesktop && isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
        </>
    );
};

export default Sidebar;