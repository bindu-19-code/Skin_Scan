// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function Register({ setIsLoggedIn }) {
//   const [step, setStep] = useState(1); // Step 1: form, Step 2: verify OTP, Step 3: set password
//   const [formData, setFormData] = useState({
//     email: "",
//   });
//   const [otp, setOtp] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // -----------------------
//   // Step 1: Send OTP
//   // -----------------------
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.email) {
//       alert("Please fill all required fields!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "http://localhost:5000/send-otp",
//         { email: formData.email },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (res.status === 200) {
//         alert("OTP sent to your email!");
//         setStep(2);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to send OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -----------------------
//   // Step 2: Verify OTP
//   // -----------------------
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     if (!otp) {
//       alert("Enter the OTP sent to your email");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "http://localhost:5000/verify-otp",
//         { email: formData.email, otp },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (res.status === 200) {
//         alert("OTP verified successfully!");
//         setStep(3);
//       } else {
//         alert(res.data.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error verifying OTP. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -----------------------
//   // Step 3: Set Password + Save User Details
//   // -----------------------
//   const handleSetPassword = async (e) => {
//     e.preventDefault();
//     if (!password) {
//       alert("Please enter a password!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "http://localhost:5000/set-password",
//         {
//           ...formData,
//           password,
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (res.status === 200) {
//         alert("Registration completed successfully!");
//         setIsLoggedIn(true);
//         navigate("/");
//       } else {
//         alert("Failed to set password. Try again.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error setting password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       {step === 1 && (
//         <>
//           <h2>Register</h2>
//           <form onSubmit={handleSendOtp}>
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleInputChange}
//               required
//             />
//             <button type="submit" disabled={loading}>
//               {loading ? "Sending OTP..." : "Send OTP"}
//             </button>
//           </form>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <h2>Verify Email</h2>
//           <p>We have sent a verification code to {formData.email}</p>
//           <form onSubmit={handleVerifyOtp}>
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//             <button type="submit" disabled={loading}>
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </form>
//         </>
//       )}

//       {step === 3 && (
//         <>
//           <h2>Set Password</h2>
//           <form onSubmit={handleSetPassword}>
//             <input
//               type="password"
//               placeholder="Enter Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button type="submit" disabled={loading}>
//               {loading ? "Setting Password..." : "Set Password"}
//             </button>
//           </form>
//         </>
//       )}
//     </div>
//   );
// }

// export default Register;
