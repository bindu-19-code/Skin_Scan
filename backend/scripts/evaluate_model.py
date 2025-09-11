import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model

# --- FIX: base directory ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
DATA_DIR = os.path.join(BASE_DIR, "dataset", "merged")
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_disease_model.h5")

# Load trained model
model = load_model(MODEL_PATH)
print("✅ Model loaded from:", MODEL_PATH)

# Data generator (same preprocessing as training)
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

# Validation set (20% split)
val_data = datagen.flow_from_directory(
    DATA_DIR,
    target_size=(128, 128),
    batch_size=32,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# Evaluate
loss, acc = model.evaluate(val_data)
print(f"📊 Validation Accuracy: {acc*100:.2f}%")
print(f"📉 Validation Loss: {loss:.4f}")
