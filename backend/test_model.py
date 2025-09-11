from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model
import numpy as np

# Load your trained model
model = load_model("skin_model.h5")
print("✅ Model loaded successfully!")

# Load and resize image to 128x128
img = load_img(r"C:\Users\LENOVO\Desktop\Major_Project\backend\ham10000\HAM10000_images_part_1\ISIC_0024316.jpg",
               target_size=(128, 128))

# Convert to array
img_array = img_to_array(img)

# Normalize if your model was trained on [0,1]
img_array = img_array / 255.0

# Add batch dimension
img_array = np.expand_dims(img_array, axis=0)  # shape: (1, 128, 128, 3)

# Predict
prediction = model.predict(img_array)
print("Prediction:", prediction)

# Example class labels (replace with your actual ones)
class_names = ["AKIEC", "BCC", "BKL", "DF", "MEL", "NV", "VASC"]

predicted_class = class_names[np.argmax(prediction)]
print("Predicted class:", predicted_class)
