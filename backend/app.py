from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Paths
MODEL_PATH = os.path.join("models", "skin_disease_model.h5")
LABELS_PATH = os.path.join("models", "class_labels.json")

# Load model
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
model = load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

# Load class labels
if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH, "r") as f:
        class_labels = json.load(f)
    print("✅ Class labels loaded:", class_labels)
else:
    class_labels = []
    print("⚠️ class_labels.json not found. Predictions may fail.")

# -----------------------------
# Severity Analysis
# -----------------------------
def analyze_severity(img_array):
    """
    Determine mild, moderate, or severe based on mean pixel intensity.
    Can later improve with lesion size, color, or texture.
    """
    mean_intensity = img_array.mean()
    if mean_intensity < 0.35:
        return "Severe"
    elif mean_intensity < 0.6:
        return "Moderate"
    else:
        return "Mild"

# -----------------------------
# Risk Assessment
# -----------------------------
def assess_risk(skin_type="III", age=30, history=False, uv_exposure=10):
    """
    Simple risk scoring system. Returns Low, Moderate, or High risk.
    """
    score = 0
    skin_type_risk = {"I": 25, "II": 20, "III": 15, "IV": 10, "V": 5, "VI": 5}
    score += skin_type_risk.get(skin_type.upper(), 10)

    if age >= 60:
        score += 20
    elif age >= 40:
        score += 10

    if history:
        score += 15

    score += uv_exposure  # assume 0-20

    if score < 30:
        return "Low Risk"
    elif score < 60:
        return "Moderate Risk"
    else:
        return "High Risk"

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        print("✅ Received file:", file.filename)

        # Preprocess image
        img = Image.open(file).convert("RGB").resize((128, 128))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

        # Predict disease
        preds = model.predict(img_array)
        pred_index = int(np.argmax(preds[0]))
        predicted_class = class_labels[pred_index] if pred_index < len(class_labels) else "Unknown"
        confidence = round(float(np.max(preds[0])), 4)

        # Severity
        severity = analyze_severity(img_array[0])

        # Risk assessment (can later get from request.form)
        risk = assess_risk()

        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence,
            "severity": severity,
            "risk": risk
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
