import { NavLink } from "react-router-dom";
import "../CSS/PublicNavbar.css";

function PublicNavbar() {
    return (
        <nav className="public-navbar">
            <div className="logo">Ehsan Bavand</div>

            <ul className="nav-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/services">Services</NavLink></li>
                <li><NavLink to="/my-app">My App</NavLink></li>
                <li><NavLink to="/contact">Contact</NavLink></li>
                <li><NavLink to="/login" className="login-btn">Login</NavLink></li>
            </ul>
        </nav>
    );
}

export default PublicNavbar;