import React from "react";

const TitleBar = ({ onLogout, onToggleSidebar }) => {
    return (
        <nav className="navbar navbar-expand-lg bg-white border-bottom px-3" style={{ minHeight: 56 }}>
            {/* Mobile hamburger to open the sidebar */}
            <button
                className="btn btn-ghost d-lg-none me-2 btn-pill"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                style={{ height: 36 }}
            >
                <i className="bi bi-list"></i>
            </button>

            <div className="flex-grow-1"></div>

            <div className="dropdown">
                <button
                    className="btn btn-ghost btn-pill dropdown-toggle d-flex align-items-center gap-2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ height: 36 }}
                >
                    <span
                        className="rounded-circle bg-success-subtle d-inline-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28 }}
                    >
                        <i className="bi bi-person text-success"></i>
                    </span>
                    <span className="d-none d-sm-inline">Account</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                    {/*<li>*/}
                    {/*    <button className="dropdown-item">*/}
                    {/*        <i className="bi bi-person-lines-fill me-2"></i> Profile*/}
                    {/*    </button>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*    <button className="dropdown-item">*/}
                    {/*        <i className="bi bi-gear me-2"></i> Settings*/}
                    {/*    </button>*/}
                    {/*</li>*/}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item text-danger" onClick={() => onLogout && onLogout()}>
                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default TitleBar;