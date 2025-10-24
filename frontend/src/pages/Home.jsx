import React, { useEffect } from "react";
import { FaCamera, FaHeartbeat, FaUserShield, FaUserMd, FaClock, FaLock } from "react-icons/fa";

function Home() {
  useEffect(() => {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible'); // remove to animate on scroll up
        }
      });
    }, { threshold: 0.3 });

    timelineItems.forEach(item => observer.observe(item));
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <span className="tag">⚡ AI-Powered Dermatology</span>
        <h1 className="hero-title">
          Advanced <span>Skin Disease</span> Detection
        </h1>
        <p className="hero-subtitle">
          Upload an image of your skin condition and get instant AI-powered insights 
          with confidence levels, severity analysis, and personalized treatment recommendations.
        </p>

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
      </div>

      {/* Features Timeline */}
      <section id="features" className="features-timeline">
        <h2 className="timeline-title">Comprehensive <span>Skin Analysis</span> Features</h2>

        <div className="timeline-container">
          <div className="timeline-item">
            <div className="timeline-circle"><FaCamera /></div>
            <h3 className="timeline-heading">Image Detection</h3>
            <p className="timeline-sub">AI-driven detection of skin conditions in just a single upload.</p>
          </div>

          <div className="timeline-item">
            <div className="timeline-circle"><FaHeartbeat /></div>
            <h3 className="timeline-heading">Severity Analysis</h3>
            <p className="timeline-sub">Instantly determine severity levels and risk factors for detected conditions.</p>
          </div>

          <div className="timeline-item">
            <div className="timeline-circle"><FaUserShield /></div>
            <h3 className="timeline-heading">Personalized Reports</h3>
            <p className="timeline-sub">Generate detailed reports with treatment recommendations and next steps.</p>
          </div>

          <div className="timeline-item">
            <div className="timeline-circle"><FaUserMd /></div>
            <h3 className="timeline-heading">Dermatologist Access</h3>
            <p className="timeline-sub">Connect with qualified dermatologists for expert guidance and consultations.</p>
          </div>

          <div className="timeline-item">
            <div className="timeline-circle"><FaClock /></div>
            <h3 className="timeline-heading">Real-Time Analysis</h3>
            <p className="timeline-sub">Get accurate results and insights within seconds of uploading your image.</p>
          </div>

          <div className="timeline-item">
            <div className="timeline-circle"><FaLock /></div>
            <h3 className="timeline-heading">Secure & Private</h3>
            <p className="timeline-sub">Your data and images are encrypted and HIPAA-compliant for full privacy.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howitworks" className="how-it-works">
        <h2>How to Use <span>Skin Scan?</span></h2>
        <div className="howitworks-grid">
          <div className="step-card">
            <div className="step-badge">1</div>
            <img src="/images/focus.png" alt="Take a photo" />
            <h3>Take a Photo</h3>
            <p>Zoom in close (less than 10 cm), keep it focused, and center only the skin mark — avoid hair, wrinkles, and background objects.</p>
          </div>
          <div className="step-card">
            <div className="step-badge">2</div>
            <img src="/images/image-upload.png" alt="Upload photo" />
            <h3>Upload & Analyze</h3>
            <p>Upload your photo to our AI system. It will process the image and run advanced skin disease detection instantly.</p>
          </div>
          <div className="step-card">
            <div className="step-badge">3</div>
            <img src="/images/research.png" alt="Receive assessment" />
            <h3>Get Results</h3>
            <p>Receive your risk assessment within 60 seconds, along with insights and suggested next steps for your skin health.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
