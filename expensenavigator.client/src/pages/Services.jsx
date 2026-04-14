
import "../CSS/Services.css";
import { Link } from "react-router-dom";

function Services() {
    return (
        <section className="services-page">
            <div className="container">

                {/* ===== HEADER ===== */}
                <div className="text-center mb-5">
                    <span className="services-eyebrow">WHAT I OFFER</span>
                    <h1 className="services-title">Services</h1>
                    <p className="services-subtitle">
                        End‑to‑end development services tailored to your business needs
                    </p>
                </div>

                {/* ===== SERVICES GRID ===== */}
                <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>Web Applications</h5>
                            <p>
                                Full‑stack web apps built with modern frameworks.
                                Scalable, secure, and fast.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>Website Design & Dev</h5>
                            <p>
                                Responsive websites — from landing pages
                                to multi‑page business sites.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>Mobile App Development</h5>
                            <p>
                                Cross‑platform mobile apps for iOS and Android
                                from a single codebase.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>API & Backend</h5>
                            <p>
                                REST & GraphQL APIs, authentication,
                                database design, and integrations.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>Performance Optimization</h5>
                            <p>
                                Improve speed, SEO, and accessibility
                                for better user experience.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="service-card">
                            <h5>Maintenance & Support</h5>
                            <p>
                                Ongoing updates, bug fixes,
                                and long‑term support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM CTA (IMAGE 4) ===== */}
                <div className="services-cta text-center">
                    <h3>Have a project in mind?</h3>
                    <p>Let’s discuss how I can help bring your idea to life.</p>

                    <Link to="/contact" className="btn btn-success btn-lg">
                        Contact Me
                    </Link>
                    {/* or: Login to My App */}
                </div>

            </div>
        </section>
    );
}

export default Services;
``