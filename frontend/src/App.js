import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import DiseaseDetection from "./pages/DiseaseDetection";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/disease-detection"
          element={
            isLoggedIn ? <DiseaseDetection /> : <Login setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? <Profile setIsLoggedIn={setIsLoggedIn} /> : <Login setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer /> {/* Footer is now outside Routes */}
    </Router>
  );
}

export default App;
