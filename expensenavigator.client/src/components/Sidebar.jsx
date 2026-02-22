import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle, isDesktop }) => {
  const handleItemClick = () => {
    if (!isDesktop) onToggle(); // Close only on mobile
  };

  return (
    <>
      <div
        className={`sidebar p-3 ${isOpen ? "d-block" : "d-none"} d-md-block`}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">💰 ExpenseNav</h5>
          <button
            className="btn btn-sm btn-outline-secondary d-md-none"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <ul className="nav flex-column">
          {[
            {
              path: "/dashboard",
              icon: "bi-house-door-fill",
              label: "Dashboard",
            },
            { path: "/income", icon: "bi-cash-coin", label: "Income" },
            {
              path: "/expenses",
              icon: "bi-cart-check-fill",
              label: "Expenses",
            },
            { path: "/saving", icon: "bi-piggy-bank-fill", label: "Saving" },
            {
              /* { path: "/settings", icon: "bi-gear-fill", label: "Settings" }, */
            },
          ].map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                className="nav-link"
                to={item.path}
                onClick={handleItemClick}
              >
                <i className={`bi ${item.icon} me-2`} /> {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Dim overlay only on mobile when open */}
      {isOpen && !isDesktop && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-md-none"
          onClick={onToggle}
          style={{ zIndex: 1030 }}
        />
      )}
    </>
  );
};

export default Sidebar;
