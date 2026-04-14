import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import "../CSS/PublicNavbar.css";

function PublicNavbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <img
                        src={logo}
                        alt="Masion Web App logo"
                        className="brand-logo"
                    />
                    <span>Masion Web App</span>
                </NavLink>
                


                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" end>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/services">Services</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/contact">Contact</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/my-app">My App</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="btn btn-success ms-lg-3" to="/login">
                                Login
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default PublicNavbar;