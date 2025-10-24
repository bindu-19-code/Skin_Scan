import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ isLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="logo">SkinScan</h2>

        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={toggleMenu}>
          <div className={`bar ${menuOpen ? "bar1" : ""}`}></div>
          <div className={`bar ${menuOpen ? "bar2" : ""}`}></div>
          <div className={`bar ${menuOpen ? "bar3" : ""}`}></div>
        </div>

        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="#howitworks" onClick={() => setMenuOpen(false)}>How It Works</a></li>

          {!isLoggedIn ? (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/disease-detection" onClick={() => setMenuOpen(false)}>Disease Detection</Link></li>
              <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
