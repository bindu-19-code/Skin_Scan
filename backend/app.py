from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os
import json
import random
from dotenv import load_dotenv
load_dotenv()
from flask_mail import Mail, Message
from pymongo import MongoClient

# ====================================
# Initialize Flask app
# ====================================
app = Flask(__name__)
CORS(app)

# ====================================
# ML Model
# ====================================
MODEL_PATH = os.path.join("models", "skin_disease_model.h5")
LABELS_PATH = os.path.join("models", "class_labels.json")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
model = load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH, "r") as f:
        class_labels = json.load(f)
    print("✅ Class labels loaded:", class_labels)
else:
    class_labels = []

def analyze_severity(img_array):
    mean_intensity = img_array.mean()
    if mean_intensity < 0.35:
        return "Severe"
    elif mean_intensity < 0.6:
        return "Moderate"
    else:
        return "Mild"

def assess_risk(skin_type="III", age=30, history=False, uv_exposure=10):
    score = 0
    skin_type_risk = {"I":25, "II":20, "III":15, "IV":10, "V":5, "VI":5}
    score += skin_type_risk.get(skin_type.upper(), 10)
    if age >= 60:
        score += 20
    elif age >= 40:
        score += 10
    if history:
        score += 15
    score += uv_exposure
    if score < 30:
        return "Low Risk"
    elif score < 60:
        return "Moderate Risk"
    else:
        return "High Risk"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error":"No image uploaded"}), 400

        file = request.files["image"]
        img = Image.open(file).convert("RGB").resize((128,128))
        img_array = np.expand_dims(np.array(img)/255.0, axis=0)

        preds = model.predict(img_array)
        pred_index = int(np.argmax(preds[0]))
        predicted_class = class_labels[pred_index] if pred_index < len(class_labels) else "Unknown"
        confidence = round(float(np.max(preds[0])),4)
        severity = analyze_severity(img_array[0])
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

# ====================================
# MongoDB setup
# ====================================
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["my_app"]
users_col = db["users"]

# ====================================
# Email setup
# ====================================
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.environ.get("EMAIL_USERNAME")  # Gmail
app.config["MAIL_PASSWORD"] = os.environ.get("EMAIL_PASSWORD")  # App password
mail = Mail(app)

otp_store = {}

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message":"Email required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    msg = Message("Your OTP Code",
                  sender=app.config["MAIL_USERNAME"],
                  recipients=[email])
    msg.body = f"Your OTP code is {otp}. Valid for 5 minutes."

    try:
        mail.send(msg)
        print(f"📩 OTP sent to {email}: {otp}")
        return jsonify({"message":"OTP sent successfully"}), 200
    except Exception as e:
        print("❌ Error sending email:", e)
        return jsonify({"message":"Failed to send OTP"}), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    if otp_store.get(email) == otp:
        del otp_store[email]
        return jsonify({"message":"OTP verified successfully"}), 200
    else:
        return jsonify({"message":"Invalid OTP"}), 400

@app.route("/set-password", methods=["POST"])
def set_password():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message":"Email and password required"}), 400

    users_col.update_one(
        {"email": email},
        {"$set": {"password": password}},
        upsert=True
    )
    return jsonify({"message":"Password set successfully"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = users_col.find_one({"email": email})
    if user and user.get("password") == password:
        return jsonify({"message":"Login successful"}), 200
    return jsonify({"message":"Invalid email or password"}), 401

# ====================================
# Run Flask app
# ====================================
if __name__ == "__main__":
    app.run(debug=True)
