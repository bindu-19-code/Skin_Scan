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
  const email = localStorage.getItem("email");
  if (!email) return;

  axios.get(`http://127.0.0.1:5000/api/profile?email=${email}`)
    .then(res => {
      console.log("Profile:", res.data);
      setProfile(res.data);
    })
    .catch(err => console.error("Profile fetch error:", err));
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
        // ✅ Save detection history after successful prediction
      const email = localStorage.getItem("email");

      if (email) {
        try {
          await axios.post("http://127.0.0.1:5000/save-history", {
            email: email,
            disease: response.data.predicted_class.name,
            severity: response.data.severity || null
          });
          console.log("History saved!");
        } catch (historyErr) {
          console.error("Error saving history:", historyErr);
        }
      }
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
      `http://127.0.0.1:5000/find-dermatologists?city=${location}`
    );
    console.log("Dermatologists:", response.data);
    setDermatologists(response.data);
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
  doc.text("Skin Disease Detection Report", 10, y);
  y += 12;

  doc.setFontSize(13);
  doc.text("Patient Details:", 10, (y += 8));

  if (profile) {
    const fields = [
      `Name: ${profile.name || "N/A"}`,
      `Email: ${profile.email || "N/A"}`,
      `Phone: ${profile.contact || "N/A"}`,
      `Age: ${profile.age || "N/A"}`,
      `Gender: ${profile.gender || "N/A"}`,
      `Address: ${profile.address || "N/A"}`,
      `Medical History: ${profile.familyHistory || "N/A"}`
    ];

    fields.forEach((field) => {
      doc.text(field, 10, (y += 8));
    });

    y += 5;
  }

  if (result) {
    doc.setFontSize(13);
    doc.text("Diagnosis Details:", 10, (y += 10));
    doc.text(`Disease: ${result.name}`, 10, (y += 8));
    doc.text(`Severity: ${result.severity}`, 10, (y += 8));

    doc.text("Description:", 10, (y += 8));
    doc.setFontSize(11);
    const splitDesc = doc.splitTextToSize(result.description, 180);
    doc.text(splitDesc, 10, (y += 8));
    y += splitDesc.length * 4;

    doc.setFontSize(13);
    doc.text("Doctor Suggestions:", 10, (y += 10));
    doc.setFontSize(11);

    result.suggestions.forEach((s) => {
      const clean = s.replace(/^\* ?/, "");
      const splitText = doc.splitTextToSize(`- ${clean}`, 180);
      doc.text(splitText, 12, (y += 8));
      y += splitText.length * 4;
    });
  }

  // Include uploaded image
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      doc.addImage(event.target.result, "JPEG", 145, 20, 50, 50);
      doc.save("Skin_Disease_Report.pdf");
    };
    reader.readAsDataURL(selectedFile);
  } else {
    doc.save("Skin_Disease_Report.pdf");
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
        <li key={i}>{s.replace(/^\* ?/, '')}</li>
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

{dermatologists.length > 0 ? (
  <ul>
    {dermatologists.map((d, index) => (
      <li key={index}>
        <b>{d.name}</b><br />
         <p>{d.address.replace(/^,\s*/, "")}</p><br />
         <a 
             href={`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lon}`} 
             target="_blank" 
             rel="noopener noreferrer"
           >
            View on Map
           </a>
      </li>
    ))}
  </ul>
) : (
  <p>No dermatologists found. Try a different location.</p>
)}
    </div>
  </div>
);
}

export default DiseaseDetection;
