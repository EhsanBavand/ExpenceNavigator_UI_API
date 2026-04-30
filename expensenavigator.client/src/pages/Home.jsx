import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

function Home() {
    useEffect(() => {
        document.body.classList.add("public-page");
        return () => document.body.classList.remove("public-page");
    }, []);

    return (
        <>
            {/* ================= HERO ================= */}
            <section className="home-hero">
                <div className="container-fluid container-lg text-center text-lg-start">
                    <span className="text-success fw-semibold small">
                        FREELANCE DEVELOPER
                    </span>

                    <h1 className="display-4 fw-bold text-white mt-3">
                        I build <span className="text-success">modern web &amp;</span>
                        <br />
                        <span className="text-success">mobile</span> experiences
                    </h1>

                    <p className="mt-3 mx-auto mx-lg-0 col-lg-6">
                        Crafting clean, performant, and user‑focused digital products
                        that help businesses grow and stand out.
                    </p>

                    <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mt-4">
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
                        <div className="skill-card">
                            <span>React / Next.js</span>
                        </div>
                        <div className="skill-card">
                            <span>Full‑Stack Web</span>
                        </div>
                        <div className="skill-card">
                            <span>Mobile Apps</span>
                        </div>
                        <div className="skill-card">
                            <span>Databases &amp; APIs</span>
                        </div>
                        <div className="skill-card">
                            <span>UI / UX Design</span>
                        </div>
                        <div className="skill-card">
                            <span>Performance</span>
                        </div>
                    </div>

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
