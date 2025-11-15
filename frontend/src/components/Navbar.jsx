import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Auth from "./Auth";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authType, setAuthType] = useState(null);
  const navigate = useNavigate();

  // Check login only once when component mounts
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

  // Scroll to section
  const handleScroll = (sectionId) => {
    setMenuOpen(false); // close mobile menu

    if (window.location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
<Link to="/" className="logo-container">
  <img
    src="/images/logo.png"
    alt="SkinScan Logo"
    className="logo-img"
  />
</Link>
          {/* Hamburger menu for mobile */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`bar ${menuOpen ? "bar1" : ""}`}></div>
            <div className={`bar ${menuOpen ? "bar2" : ""}`}></div>
            <div className={`bar ${menuOpen ? "bar3" : ""}`}></div>
          </div>

          {/* Navbar Links */}
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <span onClick={() => handleScroll("features")} className="nav-link">
                Features
              </span>
            </li>
            <li>
              <span onClick={() => handleScroll("howitworks")} className="nav-link">
                How It Works
              </span>
            </li>

            {!isLoggedIn ? (
              <>
                <li onClick={() => openAuth("login")}>Login</li>
                <li onClick={() => openAuth("register")}>Register</li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/disease-detection"
                    onClick={() => setMenuOpen(false)}
                  >
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
