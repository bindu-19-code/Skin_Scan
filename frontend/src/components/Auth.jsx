import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
import API from "../api";

const Auth = ({ isOpen, onClose, setIsLoggedIn }) => {
  const [step, setStep] = useState("login"); // login, register, verify-otp, set-password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null; // Don't render unless slider is open

  // ✅ Send OTP for registration
  const sendOtpHandler = async () => {
    try {
      await axios.post(`${API}/send-otp`, { email });
      alert("OTP sent to your email!");
      setStep("verify-otp");
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  };

  // ✅ Verify OTP
  const verifyOtpHandler = async () => {
    try {
      await axios.post(`${API}/verify-otp`, { email, otp });
      alert("OTP verified!");
      setStep("set-password");
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
  };

  // ✅ Set password after OTP verification
  const setPasswordHandler = async () => {
  try {
    const res = await axios.post(`${API}/set-password`, {
      email,
      password,
    });

    if (res.data && res.data.success) {
      localStorage.setItem("email", email);
      alert("Registration successful!");
      setIsLoggedIn(true);
      onClose();
      navigate("/");
    } else {
      alert(res.data?.message || "Error setting password");
    }
  } catch (err) {
    console.error("Error setting password:", err.response?.data || err);
    alert(err.response?.data?.message || "Error setting password");
  }
  console.log("setIsLoggedIn is:", setIsLoggedIn);
};


  // ✅ Login existing user
const loginHandler = async () => {
  try {
    const res = await axios.post(`${API}/login`, { email, password });

    if (res.data.email) {
      localStorage.setItem("email", res.data.email);  // ✅ Save email for profile fetching
    }

    alert("Login successful!");
    setIsLoggedIn(true);
    onClose();
    navigate("/"); // Redirect to home after login
  } catch (err) {
    console.error(err);
    alert("Invalid login credentials");
  }
};


  return (
    <div className={`auth-overlay ${isOpen ? "open" : ""}`}>
      <div className="auth-slider">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h1 className="auth-title">SkinScan</h1>

        {/* ✅ LOGIN STEP */}
        {step === "login" && (
          <div className="auth-section">
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={loginHandler}>Login</button>

            <p style={{ textAlign: "center", marginTop: "10px" }}>
              New user?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={() => setStep("register")}
              >
                Register
              </span>
            </p>
          </div>
        )}

        {/* ✅ REGISTER EMAIL STEP */}
        {step === "register" && (
          <div className="auth-section">
            <h2>Register</h2>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtpHandler}>Send OTP</button>

            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Already have an account?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={() => setStep("login")}
              >
                Login
              </span>
            </p>
          </div>
        )}

        {/* ✅ VERIFY OTP STEP */}
        {step === "verify-otp" && (
          <div className="auth-section">
            <h2>Verify OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtpHandler}>Verify OTP</button>
          </div>
        )}

        {/* ✅ SET PASSWORD STEP */}
        {step === "set-password" && (
          <div className="auth-section">
            <h2>Set Password</h2>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={setPasswordHandler}>Set Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
