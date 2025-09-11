import os
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model

# --- FIX: base directory ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_disease_model.h5")

# Load model
model = load_model(MODEL_PATH)
print("✅ Model loaded from:", MODEL_PATH)

# Example image path (you can replace this with any input)
IMG_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "ham10000",
    "HAM10000_images_part_1",
    "ISIC_0024316.jpg"
)

# Load and preprocess
img = load_img(IMG_PATH, target_size=(128, 128))
img_array = img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)  # shape (1,128,128,3)

# Predict
prediction = model.predict(img_array)
class_indices = model.output_shape[-1]  # just number of classes
print("Raw prediction:", prediction)

# If you trained with datagen.flow_from_directory, restore labels:
# Get same ordering of classes as training
from tensorflow.keras.preprocessing.image import ImageDataGenerator
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
temp_gen = datagen.flow_from_directory(
    os.path.join(BASE_DIR, "dataset", "merged"),
    target_size=(128, 128),
    batch_size=1,
    class_mode='categorical',
    subset="training"
)
class_labels = list(temp_gen.class_indices.keys())

predicted_class = class_labels[np.argmax(prediction)]
print("🎯 Predicted class:", predicted_class)
