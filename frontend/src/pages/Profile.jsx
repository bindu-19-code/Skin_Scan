// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Added useLocation import
import "../App.css";
import API from "../api";

function Profile({ userEmail }) {
  const location = useLocation(); // ✅ Added this
  const [activeTab, setActiveTab] = useState("info");
  const [loading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // ✅ Token detection from reset link
  // ✅ Token detection from reset link
const queryParams = new URLSearchParams(location.search);
const tokenFromURL = queryParams.get("token");
const emailFromURL = queryParams.get("email");

useEffect(() => {
  if (tokenFromURL && emailFromURL) {
    setActiveTab("settings");
    localStorage.setItem("token", tokenFromURL);
  }
}, [tokenFromURL, emailFromURL]);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    contact: "",
    age: "",
    dob: "",
    gender: "",
    address: "",
    medicalHistory: "",
  });

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // ✅ Inline Reset Password Component (unchanged)
  const ResetPasswordInsideProfile = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      await axios.post(`${API}/reset-password`, {
        email,
        token,
        newPassword: password, // backend expects this
      });
      setMessage("Password reset successful! Redirecting to home page...");
      setTimeout(() => (window.location.href = "/home"), 2000);
    } catch (err) {
      setMessage(" Invalid or expired link.");
    }
  };

  return (
    <div className="reset-password-form modern-form">
      <h3>Set New Password</h3>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="save-btn">
          Update Password
        </button>
      </form>
      {message && (
        <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
      )}
    </div>
  );
};

  // ✅ Fetch profile info
// 🔥 Add this function to fix the error
const fetchProfile = async (email) => {
  try {
    const res = await fetch(`${API}/api/user/${email}`);
    const data = await res.json();

    setProfileData({
      name: data.name || "",
      email: data.email || "",
      contact: data.contact || "",
      age: data.age || "",
      dob: data.dob || "",
      gender: data.gender || "",
      address: data.address || "",
      medicalHistory: data.medicalHistory || "",
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
};


  // ✅ Fetch detection history
useEffect(() => {
  const email = localStorage.getItem("email");
  if (!email) return;    // stop running if not logged in

  fetchProfile(email);

  fetch(`${API}/get-history?email=${email}`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    })
    .catch((err) => console.error("Error fetching history:", err));
}, []);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  const storedEmail = localStorage.getItem("email");
  if (!storedEmail) {
    alert("User not logged in");
    return;
  }

  const bodyData = {
    email: storedEmail,
    name: profileData.name,
    contact: profileData.contact,
    age: profileData.age,
    dob: profileData.dob,
    gender: profileData.gender,
    address: profileData.address,
    History: profileData.History
  };

  try {
    await axios.post(`${API}/update-user`, bodyData);
    alert("Profile updated successfully!");
    setIsEditing(false);
  } catch (err) {
    console.error(err.response);
    alert(err.response?.data?.error || "Update failed");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");

  // If you store anything else, remove it too
  navigate("/login");
  window.location.reload();  // force reload so UI updates
};

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/send-reset-link`, {
        email: resetEmail,
      });
      setResetMessage(res.data.message);
      setShowResetForm(false);
    } catch (err) {
      setResetMessage(err.response?.data?.message || "Failed to send reset link. Try again.");
    }
  };

  return (
    <div className="profile-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>SkinScan</h2>
        <ul>
          <li className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>Personal Info</li>
          <li className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>Detection History</li>
          <li className={activeTab === "faq" ? "active" : ""} onClick={() => setActiveTab("faq")}>FAQs</li>
          <li className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>Settings</li>
          <li onClick={handleLogout} className="logout-btn">Logout</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="profile-content">
        {activeTab === "info" && (
          // ✅ personal info tab (unchanged)
          <div className="profile-section">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {!isEditing ? (
                  <div className="personal-info-card">
                    <div className="personal-info-header">
                      <h2>Personal Information</h2>
                      <div className="profile-avatar">
                        {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    </div>
                    <div className="personal-info-body">
                      <div className="info-item"><span className="info-label">Name</span><span className="info-value">{profileData.name}</span></div>
                      <div className="info-item"><span className="info-label">Email</span><span className="info-value">{profileData.email}</span></div>
                      <div className="info-item"><span className="info-label">Contact</span><span className="info-value">{profileData.contact}</span></div>
                      <div className="info-item"><span className="info-label">Age</span><span className="info-value">{profileData.age}</span></div>
                      <div className="info-item"><span className="info-label">Date of Birth</span><span className="info-value">{profileData.dob}</span></div>
                      <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{profileData.gender}</span></div>
                      <div className="info-item full"><span className="info-label">Address</span><span className="info-value">{profileData.address}</span></div>
                      <div className="info-item full"><span className="info-label"> History</span><span className="info-value">{profileData.History}</span></div>
                    </div>
                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="profile-form modern-form">
                    <div className="form-grid">
                      <div className="form-group"><label>Full Name</label><input type="text" name="name" value={profileData.name} onChange={handleInputChange} required /></div>
                      <div className="form-group"><label>Email</label><input type="email" name="email" value={profileData.email} onChange={handleInputChange} disabled /></div>
                      <div className="form-group"><label>Contact Number</label><input type="tel" name="contact" value={profileData.contact} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Age</label><input type="number" name="age" value={profileData.age} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" value={profileData.dob} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Gender</label>
                        <select name="gender" value={profileData.gender} onChange={handleInputChange}>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group full"><label>Address</label><input type="text" name="address" value={profileData.address} onChange={handleInputChange} /></div>
                      <div className="form-group full"><label> History</label><textarea name="History" value={profileData.History} onChange={handleInputChange}></textarea></div>
                    </div>
                    <div className="button-group">
                      <button type="submit" className="save-btn">{loading ? "Saving..." : "Save"}</button>
                      <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="profile-section fancy-card">
            <h2 className="section-title">Detection History</h2>
            {history.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr><th>#</th><th>Disease Name</th><th>Severity</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {typeof item.predicted_class === "string"
                          ? item.predicted_class
                          : item.predicted_class?.name || "Unknown"}
                      </td>
                      <td>{item.severity ? `${item.severity}` : "-"}</td>
                      <td>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No detection history available.</p>
            )}
          </div>
        )}

        {activeTab === "faq" && (
          <div className="profile-section fancy-card">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq">
              <h4>1. How accurate are the results?</h4>
              <p>Our AI model provides high accuracy, but it's always best to consult a dermatologist for confirmation.</p><br />
              <h4>2. Is my data secure?</h4>
              <p>Yes, all user data and history are securely stored and never shared without consent.</p><br />
              <h4>3. Can I delete my detection history?</h4>
              <p>Yes, upcoming updates will allow users to manage or delete their past records easily.</p>
            </div>
          </div>
        )}

        {/* ✅ Settings Section */}
        {/* ✅ Settings Section */}
{activeTab === "settings" && (
  <div className="profile-section fancy-card">
    <h2 className="section-title">Account Settings</h2>

    {/* When token is not in URL → show request reset link form */}
    {!tokenFromURL && (
      <>
        {!showResetForm ? (
          <>
            <p className="settings-description">
              You can request a password reset link to your registered email.
            </p>
            <button
              onClick={() => setShowResetForm(true)}
              className="save-btn"
              style={{ marginTop: "10px" }}
            >
              Reset Password
            </button>
          </>
        ) : (
          <form onSubmit={handleResetPassword} className="password-form modern-form">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" className="save-btn">
              Send Reset Link
            </button>
          </form>
        )}

        {resetMessage && (
          <p style={{ marginTop: "10px", color: "green" }}>{resetMessage}</p>
        )}
      </>
    )}

    {/* ✅ When reset link contains token → show inline new password form */}
    {tokenFromURL && <ResetPasswordInsideProfile />}
  </div>
)}
      </div>
    </div>
  );
}

export default Profile;
