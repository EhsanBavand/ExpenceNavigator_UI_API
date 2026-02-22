// import React, { useState } from "react";
// import { register } from "../services/api";
// import { useNavigate, Link } from "react-router-dom";

// function Register() {
//   const [form, setForm] = useState({ username: "", email: "", password: "" });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await register(form);
//       setSuccess(res.data.message);
//       setError("");
//       setTimeout(() => navigate("/login"), 1500);
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//       setSuccess("");
//     }
//   };

//   return (
//     <div className="container mt-5" style={{ maxWidth: "400px" }}>
//       <h2 className="mb-4 text-center">Register</h2>
//       <form onSubmit={handleSubmit} noValidate>
//         <div className="mb-3">
//           <label htmlFor="username" className="form-label">
//             Username
//           </label>
//           <input
//             id="username"
//             name="username"
//             value={form.username}
//             onChange={handleChange}
//             className="form-control"
//             required
//             autoComplete="username"
//           />
//         </div>

//         <div className="mb-3">
//           <label htmlFor="email" className="form-label">
//             Email
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={handleChange}
//             className="form-control"
//             required
//             autoComplete="email"
//           />
//         </div>

//         <div className="mb-3">
//           <label htmlFor="password" className="form-label">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             value={form.password}
//             onChange={handleChange}
//             className="form-control"
//             required
//             autoComplete="new-password"
//           />
//         </div>

//         {error && <div className="text-danger mb-3">{error}</div>}
//         {success && <div className="text-success mb-3">{success}</div>}

//         <button type="submit" className="btn btn-success w-100">
//           Register
//         </button>
//       </form>

//       <p className="mt-3 text-center">
//         Already have an account? <Link to="/login">Login here</Link>
//       </p>
//     </div>
//   );
// }

// export default Register;
