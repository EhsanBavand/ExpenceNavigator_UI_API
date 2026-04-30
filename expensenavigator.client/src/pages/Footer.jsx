import "../css/Footer.css";

function Footer() {
    const currentYear = new Date().getFullYear(); // ✅ get year

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-left">
                    © {currentYear }<span> Maison Web App</span>. All rights reserved.
                </div>

                <div className="footer-right">
                    <a
                        href="https://www.linkedin.com/in/ehsan-bavand-5a00a9140/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        {/* LinkedIn Icon (Lucide-style SVG) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="footer-icon"
                        >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;