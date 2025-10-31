import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [dermatologists, setDermatologists] = useState([]);
  const [profile, setProfile] = useState(null);

  // Fetch user profile info (assuming JWT or userId stored)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/profile");
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Backend response:", response.data);

      if (response.data && response.data.predicted_class) {
        setResult({
          name: response.data.predicted_class.name,
          description: response.data.predicted_class.description,
          severity: response.data.severity,
          suggestions: response.data.suggestions || [
            "Keep affected area clean.",
            "Use prescribed ointment.",
            "Avoid scratching or irritation.",
          ],
        });
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error while predicting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search dermatologists in entered location
  const handleSearchDermatologists = async () => {
    if (!location) return;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dermatologists+in+${location}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const results = response.data.results || [];
      setDermatologists(results);
    } catch (err) {
      console.error("Error fetching dermatologists:", err);
      setError("Could not fetch dermatologist data.");
    }
  };

  // Download PDF Report
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("Disease Detection Report", 10, y);
    y += 10;

    doc.setFontSize(12);
    if (profile) {
      doc.text(`Name: ${profile.name}`, 10, (y += 8));
      doc.text(`Email: ${profile.email}`, 10, (y += 8));
    }

    if (selectedFile) {
      doc.text(`Uploaded Image: ${selectedFile.name}`, 10, (y += 8));
    }

    if (result) {
      doc.text(`Disease: ${result.name}`, 10, (y += 10));
      doc.text(`Severity: ${result.severity}`, 10, (y += 8));
      doc.text(`Description:`, 10, (y += 8));
      doc.text(doc.splitTextToSize(result.description, 180), 10, (y += 8));
      doc.text(`Suggestions:`, 10, (y += 8));
      result.suggestions.forEach((s, i) => {
        doc.text(`- ${s}`, 12, (y += 8));
      });
    }

    // Optional: add uploaded image preview in PDF
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imgData = event.target.result;
        doc.addImage(imgData, "JPEG", 140, 20, 50, 50);
        doc.save("Disease_Report.pdf");
      };
      reader.readAsDataURL(selectedFile);
    } else {
      doc.save("Disease_Report.pdf");
    }
  };

return (
  <div className="disease-detection-container">
    <h2>Disease Detection</h2>

    <form onSubmit={handleSubmit} className="file-upload">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <button type="submit">Upload & Predict</button>
    </form>

    {selectedFile && (
      <div className="preview-section">
        <p>Preview:</p>
        <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
      </div>
    )}

    {loading && <p className="loading">Analyzing image...</p>}
    {error && <p className="error">{error}</p>}

    {result && (
      <div className="result-card">
        <h3>Prediction Result</h3>
        <p><b>Disease:</b> {result.name}</p>
        <p><b>Description:</b> {result.description}</p>
        <p><b>Severity:</b> {result.severity}</p>
        <h4>Suggestions:</h4>
        <ul>
          {result.suggestions && (
  <div>
    <ul>
      {result.suggestions.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  </div>
)}
        </ul>
        <button onClick={handleDownloadPDF}>Download Report as PDF</button>
      </div>
    )}

    <div className="location-section">
      <h3>Find Dermatologists Near You</h3>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter your city or area"
      />
      <button onClick={handleSearchDermatologists}>Search</button>

      {dermatologists.length > 0 && (
        <ul>
          {dermatologists.map((d, index) => (
            <li key={index}>
              <b>{d.name}</b> — {d.formatted_address}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);
}

export default DiseaseDetection;
