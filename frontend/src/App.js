import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profile";
import DiseaseDetection from "./pages/DiseaseDetection";
import Footer from "./components/Footer";
import "./App.css";
import ResetPassword from './pages/ResetPassword';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false); // controls slide visibility

  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => setAuthOpen(false);

  return (
    <Router>
      {/* Navbar now receives login state */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onLoginClick={openAuth} />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/disease-detection"
          element={
            isLoggedIn ? (
              <DiseaseDetection />
            ) : (
              <Home />
            )
          }
        />

        <Route
  path="/profile"
  element={
    window.location.search.includes("token=") ? (
      <Profile />
    ) : isLoggedIn ? (
      <Profile />
    ) : (
      <Navigate to="/" />
    )
  }
/>

        <Route path="*" element={<Home />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>

      {/* Auth slider overlay */}
      <Auth
        isOpen={authOpen}
        onClose={closeAuth}
        setIsLoggedIn={setIsLoggedIn}
      />
      <Footer />
    </Router>
  );
}

export default App;
