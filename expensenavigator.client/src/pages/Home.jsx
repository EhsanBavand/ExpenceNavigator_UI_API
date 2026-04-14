import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../CSS/Home.css";

function Home() {
    useEffect(() => {
        document.body.classList.add("public-page");
        return () => document.body.classList.remove("public-page");
    }, []);

    return (
        <>
            {/* ================= HERO ================= */}
            <section className="home-hero">
                <div className="container">
                    <span className="text-success fw-semibold small">
                        FREELANCE DEVELOPER
                    </span>

                    <h1 className="display-4 fw-bold text-white mt-3">
                        I build <span className="text-success">modern web &amp;</span>
                        <br />
                        <span className="text-success">mobile</span> experiences
                    </h1>

                    <p className="mt-3 col-lg-6">
                        Crafting clean, performant, and user‑focused digital products
                        that help businesses grow and stand out.
                    </p>

                    <div className="d-flex gap-3 mt-4">
                        <Link to="/login" className="btn btn-success btn-lg">
                            Login to My App
                        </Link>
                        <Link to="/services" className="btn btn-outline-light btn-lg">
                            My Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= SKILLS ================= */}
            <section className="home-skills">
                <div className="container text-center">
                    <h2 className="skills-title">Skills &amp; Expertise</h2>
                    <p className="skills-subtitle">
                        Technologies and disciplines I work with every day
                    </p>

                    <div className="skills-grid">
                        {/* React / Next */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <path d="m18 16 4-4-4-4" />
                                <path d="m6 8-4 4 4 4" />
                                <path d="m14.5 4-5 16" />
                            </svg>
                            <span>React / Next.js</span>
                        </div>

                        {/* Full Stack */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20" />
                            </svg>
                            <span>Full‑Stack Web</span>
                        </div>

                        {/* Mobile */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <rect x="5" y="2" width="14" height="20" rx="2" />
                                <path d="M12 18h.01" />
                            </svg>
                            <span>Mobile Apps</span>
                        </div>

                        {/* Database */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <ellipse cx="12" cy="5" rx="9" ry="3" />
                                <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                            </svg>
                            <span>Databases &amp; APIs</span>
                        </div>

                        {/* UI UX */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            <span>UI / UX Design</span>
                        </div>
                        
                        {/* Performance */}
                        <div className="skill-card">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="skill-icon"
                            >
                                <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
                            </svg>
                            <span>Performance</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="home-cta">
                        <h3>Ready to start a project?</h3>
                        <p>
                            Let’s discuss your idea and turn it into a beautiful,
                            functional product.
                        </p>
                        <Link to="/contact" className="btn btn-success btn-lg">
                            Let’s Talk
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;