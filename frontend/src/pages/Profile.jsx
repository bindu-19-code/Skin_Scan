import React from "react";
import { useNavigate } from "react-router-dom";

function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/"); // ✅ Redirects to Home after logout
  };

  return (
    <div>
      <h2>Your Profile</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
