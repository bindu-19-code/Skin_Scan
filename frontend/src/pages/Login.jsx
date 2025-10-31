// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function Login({ setIsLoggedIn }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       alert("Please enter both email and password");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post("http://localhost:5000/login", {
//         email,
//         password,
//       });

//       if (res.status === 200) {
//         alert("Login successful!");
//         setIsLoggedIn(true); // update app state
//         navigate("/");       // redirect to Home page
//       } else {
//         alert(res.data.message || "Login failed. Check your email or password.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Login failed. Check your email or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Login;
