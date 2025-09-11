import React from "react";

function Home() {
  return (
    <div>
      <div className="hero-section">
  <span className="tag">⚡ AI-Powered Dermatology</span>
  <h1 className="hero-title">
    Advanced <span>Skin Disease</span> Detection
  </h1>
  <p className="hero-subtitle">
    Upload an image of your skin condition and get instant AI-powered insights 
    with confidence levels, severity analysis, 
    and personalized treatment recommendations.
  </p>
</div>
<div className="hero-image-card">
        <img src="/images/image1.png" alt="Skin scan demo" />
        <div className="badge bottom-left">
          <strong>95% Accuracy</strong>
          <p>AI Confidence</p>
        </div>
        <div className="badge top-right">
          <strong>Instant</strong>
          <p>Analysis</p>
        </div>
      </div>
{/* <div className="hero-image">
    <img src="/images/image1.png" alt="Skin scan demo" />
  </div> */}
      {/* Features Section */}
      <section id="features" className="features">
        <h2>Features</h2>
        <ul>
          <li>✔ Easy to use</li>
          <li>✔ Secure login</li>
          <li>✔ Profile management</li>
        </ul>
      </section>

      {/* How It Works Section */}
      <section id="howitworks" className="how-it-works">
        <h2>How It Works</h2>
        <p>Step 1: Register → Step 2: Login → Step 3: Use our services!</p>
      </section>
    </div>
  );
}

export default Home;
















      