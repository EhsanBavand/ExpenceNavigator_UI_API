import { Link } from "react-router-dom";
import "../CSS/MyApp.css";

function MyApp() {
    return (
        <>
            {/* ===== HERO ===== */}
            <section className="app-hero">
                <div className="container text-center">
                    <span className="app-eyebrow">MY APPLICATION</span>

                    <h1 className="app-title">Expense Navigator</h1>

                    <p className="app-subtitle">
                        A modern personal finance web application designed to help users
                        track income, expenses, savings, and budgets in one place.
                    </p>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Link to="/login" className="btn btn-success btn-lg">
                            Login to App
                        </Link>
                        <Link to="/contact" className="btn btn-outline-light btn-lg">
                            Contact Me
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== ABOUT ===== */}
            <section className="app-about">
                <div className="container text-center">
                    <h2>What Expense Navigator Does</h2>
                    <p>
                        Expense Navigator helps users understand where their money comes
                        from and where it goes. It provides a clear overview of financial
                        activity and supports better budgeting and planning.
                    </p>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="app-features">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Income Tracking</h5>
                                <p>Manage income with monthly and yearly filtering.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Expense Management</h5>
                                <p>Track expenses and analyze spending habits.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Categories & Budgets</h5>
                                <p>Create categories and manage monthly budgets.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Dashboard</h5>
                                <p>Visual overview of income, expenses, and savings.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Savings</h5>
                                <p>Track yearly savings and extra money.</p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <h5>Secure Authentication</h5>
                                <p>Login, registration, and password recovery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="app-cta">
                <div className="container text-center">
                    <h2>Try Expense Navigator</h2>
                    <p>Log in and explore the full application experience.</p>
                    <Link to="/login" className="btn btn-success btn-lg">
                        Go to Login
                    </Link>
                </div>
            </section>
        </>
    );
}

export default MyApp;


