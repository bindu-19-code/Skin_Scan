from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy classes
classes = ["Acne", "Eczema", "Psoriasis", "Dermatitis", "Melanoma"]

@app.post("/predict")
async def predict_skin_disease(file: UploadFile = File(...)):
    # For now, we don’t process the image
    import random
    predicted_class = random.choice(classes)
    confidence = round(random.uniform(0.7, 0.99), 2)

    return {
        "disease": predicted_class,
        "confidence": confidence
    }
