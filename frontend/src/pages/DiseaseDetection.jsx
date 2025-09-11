import React, { useState } from "react";
import axios from "axios";

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        if (response.data && response.data.predicted_class) {
  setResult({
    predicted_class: response.data.predicted_class, // object: {name, description}
    confidence: response.data.confidence || 0,
    severity: response.data.severity,
    risk: response.data.risk
  });
}
      } else if (response.data && response.data.error) {
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

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Disease Detection</h2>

      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <br /><br />
        <button type="submit">Upload & Predict</button>
      </form>

      {selectedFile && (
        <div style={{ marginTop: "10px" }}>
          <p>Preview:</p>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            style={{ maxWidth: "300px" }}
          />
        </div>
      )}

      {loading && <p>Analyzing image...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
  <div style={{ marginTop: "20px" }}>
    <h3>Prediction Result:</h3>
    <p><b>Disease:</b> {result.predicted_class.name}</p>
    <p><b>Description:</b> {result.predicted_class.description}</p>
    <p><b>Confidence:</b> {(result.confidence * 100).toFixed(2)}%</p>
    <p><b>Severity:</b> {result.severity}</p>
    <p><b>Risk:</b> {result.risk}</p>
  </div>
)}
    </div>
  );
}

export default DiseaseDetection;
