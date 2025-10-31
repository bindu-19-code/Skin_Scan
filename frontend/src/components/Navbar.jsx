import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Auth from "./Auth";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authType, setAuthType] = useState(null);

  // ✅ Check login only once when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const openAuth = (type) => {
    setAuthType(type);
    setMenuOpen(false);
  };

  const closeAuth = () => setAuthType(null);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="logo">SkinScan</h2>

          {/* Hamburger menu for mobile */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`bar ${menuOpen ? "bar1" : ""}`}></div>
            <div className={`bar ${menuOpen ? "bar2" : ""}`}></div>
            <div className={`bar ${menuOpen ? "bar3" : ""}`}></div>
          </div>

          {/* Navbar Links */}
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            </li>
            <li>
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            </li>
            <li>
              <a href="#howitworks" onClick={() => setMenuOpen(false)}>How It Works</a>
            </li>

            {!isLoggedIn ? (
              <>
                <li onClick={() => openAuth("login")}>Login</li>
                <li onClick={() => openAuth("register")}>Register</li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/disease-detection" onClick={() => setMenuOpen(false)}>
                    Disease Detection
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Auth Slide Overlay */}
      <Auth
        isOpen={!!authType}
        type={authType}
        onClose={closeAuth}
        setIsLoggedIn={setIsLoggedIn}
      />
    </>
  );
}

export default Navbar;
