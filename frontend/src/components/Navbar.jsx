import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isLoggedIn }) {
  return (
    <nav className="navbar">
      <h2 className="logo">SkinScan</h2>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#howitworks">How It Works</a></li>

        {!isLoggedIn ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/disease-detection">Disease Detection</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
