import { Link } from "react-router-dom";
import "../css/MyApp.css";

function MyApp() {
    return (
        <>
            {/* ===== HERO ===== */}
            <section className="app-hero text-center py-5">
                <div className="container px-3">
                    <span className="text-success fw-semibold small">
                        MY APPLICATION
                    </span>

                    <h1 className="app-title">
                        Masion Web App
                    </h1>

                    <p className="app-subtitle">
                        A modern web platform built to demonstrate real‑world
                        full‑stack architecture, authentication, and scalability.
                    </p>

                    <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
                        <Link to="/login" className="btn btn-success btn-lg">
                            Login
                        </Link>
                        <Link to="/contact" className="btn btn-outline-light btn-lg">
                            Request Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== ABOUT ===== */}
            <section className="app-about text-center">
                <div className="container px-3">
                    <h2>About the App</h2>
                    <p>
                        This application showcases authentication flows, protected
                        routes, dashboards, REST APIs, and clean UI patterns using
                        modern web technologies.
                    </p>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="app-features">
                <div className="container px-3">
                    <div className="row g-4">

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Authentication</h5>
                                <p>
                                    Secure login and session handling with protected
                                    routes and role‑based access.
                                </p>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Dashboard</h5>
                                <p>
                                    Clean, responsive dashboards optimized for
                                    productivity and clarity.
                                </p>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>API Integration</h5>
                                <p>
                                    Scalable REST APIs with modern backend architecture
                                    and best practices.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="app-cta text-center">
                <div className="container px-3">
                    <h2>Want access to the app?</h2>
                    <p>
                        Sign in to explore the platform or contact me for a walkthrough.
                    </p>
                    <Link to="/login" className="btn btn-success btn-lg">
                        Login Now
                    </Link>
                </div>
            </section>
        </>
    );
}

export default MyApp;