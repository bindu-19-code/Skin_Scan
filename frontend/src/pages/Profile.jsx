import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile({ setIsLoggedIn, userEmail }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    contact: "",
    dob: "",
    gender: "",
    address: "",
    medicalHistory: "",
  });

  // Fetch user data from backend on component mount
  useEffect(() => {
    if (!userEmail) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/get-user?email=${userEmail}`);
        if (res.status === 200) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/update-user", {
        email: userEmail,
        ...profileData,
      });
      if (res.status === 200) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/"); // Redirect to Home after logout
  };

  return (
    <div className="form-container">
      <h2>Your Profile</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={profileData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userEmail}
            disabled
          />
          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={profileData.contact}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={profileData.dob}
            onChange={handleInputChange}
          />
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={profileData.address}
            onChange={handleInputChange}
          />
          <textarea
            name="medicalHistory"
            placeholder="Medical History"
            value={profileData.medicalHistory}
            onChange={handleInputChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
