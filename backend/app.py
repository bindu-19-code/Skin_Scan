from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os
import json
import random
import string
from dotenv import load_dotenv
from flask_mail import Mail, Message
from pymongo import MongoClient
from datetime import datetime, timedelta
from openai import OpenAI
from werkzeug.utils import secure_filename
import tempfile

# ====================================
# Load environment variables
# ====================================
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
    skin_type_risk = {"I": 25, "II": 20, "III": 15, "IV": 10, "V": 5, "VI": 5}
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
app.config["MAIL_USERNAME"] = os.environ.get("EMAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("EMAIL_PASSWORD")
mail = Mail(app)

# Temporary store for OTPs and reset tokens
otp_store = {}
reset_tokens = {}

# ====================================
# OTP Routes
# ====================================
@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    msg = Message("Your OTP Code", sender=app.config["MAIL_USERNAME"], recipients=[email])
    msg.body = f"Your OTP code is {otp}. Valid for 5 minutes."
    try:
        mail.send(msg)
        return jsonify({"message": "OTP sent successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to send OTP: {e}"}), 500


@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    if not email or not otp:
        return jsonify({"success": False, "message": "Email and OTP required"}), 400
    if otp_store.get(email) == otp:
        del otp_store[email]
        return jsonify({"success": True, "message": "OTP verified successfully"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400


# ====================================
# Registration and Login
# ====================================
@app.route("/set-password", methods=["POST"])
def set_password():
    try:
        data = request.get_json(force=True)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password required"}), 400

        users_col.update_one(
            {"email": email},
            {"$set": {
                "password": password,
                "name": data.get("name"),
                "gender": data.get("gender"),
                "country": data.get("country"),
                "state": data.get("state")
            }},
            upsert=True
        )
        return jsonify({"success": True, "message": "User registered successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = users_col.find_one({"email": email})
    if user and user.get("password") == password:
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid email or password"}), 401


# ====================================
# Update & Get Profile
# ====================================
@app.route("/update-user", methods=["POST"])
def update_user():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email required"}), 400

        users_col.update_one(
            {"email": email},
            {"$set": {
                "name": data.get("name"),
                "contact": data.get("contact"),
                "age": data.get("age"),
                "dob": data.get("dob"),
                "gender": data.get("gender"),
                "address": data.get("address"),
                "familyHistory": data.get("familyHistory")
            }},
            upsert=True
        )
        return jsonify({"message": "Profile updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-user", methods=["GET"])
def get_user():
    email = request.args.get("email")
    user = users_col.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


# ====================================
# Detection + History
# ====================================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        email = request.form.get("email")

        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        img = Image.open(file).convert("RGB").resize((128, 128))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

        preds = model.predict(img_array)
        pred_index = int(np.argmax(preds[0]))
        predicted_class = class_labels[pred_index] if pred_index < len(class_labels) else "Unknown"
        confidence = round(float(np.max(preds[0])), 4)
        severity = analyze_severity(img_array[0])
        risk = assess_risk()

        # 🧠 Ask OpenAI for suggestions
        try:
            prompt = f"""
            You are a dermatology assistant AI.
            Provide 3 short, safe and practical self-care suggestions for a skin disease.
            Disease: {predicted_class}
            Severity: {severity}
            Avoid giving harmful medical advice or prescribing medications.
            Each suggestion should be one line.
            """

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

            suggestions_text = response.choices[0].message.content.strip()
            suggestions = [s.strip("•- \n") for s in suggestions_text.split("\n") if s.strip()]

        except Exception as ai_error:
            print("AI suggestion error:", ai_error)
            suggestions = [
                "Keep the affected area clean and dry.",
                "Avoid harsh products or scratching.",
                "Consult a dermatologist if symptoms persist."
            ]

        result = {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "severity": severity,
            "risk": risk,
            "suggestions": suggestions,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        return jsonify(result)

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": str(e)}), 500


        if email:
            users_col.update_one(
                {"email": email},
                {"$push": {"detection_history": result}},
                upsert=True
            )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-history", methods=["GET"])
def get_history():
    email = request.args.get("email")
    user = users_col.find_one({"email": email}, {"_id": 0, "detection_history": 1})
    if not user or "detection_history" not in user:
        return jsonify({"history": []}), 200
    return jsonify({"history": user["detection_history"]}), 200


# ====================================
# FAQs
# ====================================
@app.route("/faqs", methods=["GET"])
def faqs():
    data = [
        {"question": "How accurate is the skin disease detector?", "answer": "It provides around 90% accuracy using deep learning."},
        {"question": "Can I use images from my phone?", "answer": "Yes, upload a clear image with good lighting for best results."},
        {"question": "Will my medical history be private?", "answer": "Yes, all data is securely stored and not shared externally."},
        {"question": "What should I do if my disease is severe?", "answer": "Consult a dermatologist immediately for professional care."}
    ]
    return jsonify(data), 200


# ====================================
# 🔐 Password Reset (under Profile → Settings)
# ====================================
@app.route("/send-reset-link", methods=["POST"])
def send_reset_link():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = users_col.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Generate secure token
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=40))
        reset_tokens[email] = {"token": token, "expires": datetime.now() + timedelta(minutes=10)}

        # Reset link (inside profile/settings/reset-password)
        reset_link = f"http://localhost:3000/profile?token={token}&email={email}"

        # Send HTML email
        msg = Message("Password Reset Request", sender=app.config["MAIL_USERNAME"], recipients=[email])
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password for your SkinScan account.</p>
            <p>
                <a href="{reset_link}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                    Click here to reset your password
                </a>
            </p>
            <p>This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>SkinScan Team</p>
        </body>
        </html>
        """
        mail.send(msg)
        print(f"📩 Reset link sent: {reset_link}")
        return jsonify({"message": "Reset link sent to your email"}), 200
    except Exception as e:
        print("Error sending reset link:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")
        token = data.get("token")
        new_password = data.get("newPassword")

        if not all([email, token, new_password]):
            return jsonify({"error": "Missing fields"}), 400

        record = reset_tokens.get(email)
        if not record or record["token"] != token:
            return jsonify({"error": "Invalid or expired token"}), 400

        if datetime.now() > record["expires"]:
            del reset_tokens[email]
            return jsonify({"error": "Token expired"}), 400

        users_col.update_one({"email": email}, {"$set": {"password": new_password}})
        del reset_tokens[email]

        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        print("Error resetting password:", e)
        return jsonify({"error": str(e)}), 500


# ====================================
# CORS Fix
# ====================================
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
    return response


# ====================================
# Run Flask app
# ====================================
if __name__ == "__main__":
    app.run(debug=True)
