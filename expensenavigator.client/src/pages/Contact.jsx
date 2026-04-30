import "../css/Contact.css";
import { useState } from "react";
import { sendContactMessage } from "../services/api";

function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.message) {
            setSuccess("Please fill all fields.");
            return;
        }

        setLoading(true);
        setSuccess(null);

        try {
            await sendContactMessage(form);
            setSuccess("Message sent successfully! ✅");
            setForm({ name: "", email: "", message: "" });
        } catch {
            setSuccess("Failed to send message ❌");
        }

        setLoading(false);
    };

    return (
        <section className="contact-page">
            <div className="container">

                {/* ===== HEADER ===== */}
                <div className="text-center mb-5 px-3">
                    <span className="contact-eyebrow">GET IN TOUCH</span>
                    <h1 className="contact-title">Contact Me</h1>
                    <p className="contact-subtitle">
                        Have a question or want to work together? Drop me a message!
                    </p>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="row g-5 justify-content-center align-items-start">

                    {/* INFO */}
                    <div className="col-12 col-md-8 col-lg-3">
                        <div className="contact-info text-center text-lg-start">
                            <div className="info-item">
                                <span>Email</span>
                                <p>ehsanbavandsavadkohei@gmail.com</p>
                            </div>
                            <div className="info-item">
                                <span>Phone</span>
                                <p>+1 (514) 815-3732</p>
                            </div>
                            <div className="info-item">
                                <span>Location</span>
                                <p>Montreal, CA</p>
                            </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="col-12 col-md-10 col-lg-7">
                        <form className="contact-form" onSubmit={handleSubmit}>

                            <div className="mb-3">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="you@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label>Message</label>
                                <textarea
                                    rows="5"
                                    name="message"
                                    className="form-control"
                                    placeholder="Tell me about your project..."
                                    value={form.message}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg w-100"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>

                            {success && (
                                <div className="mt-3 text-center contact-feedback">
                                    {success}
                                </div>
                            )}
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Contact;