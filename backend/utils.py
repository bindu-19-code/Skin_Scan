from PIL import Image
import numpy as np

def preprocess_image(image: Image.Image, target_size=(224, 224)):
    """
    Resize, normalize image for model prediction
    """
    image = image.convert("RGB")
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0  # normalize 0-1
    return image_array
