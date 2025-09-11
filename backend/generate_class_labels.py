import json
import os

# Original dataset folder names
folders = [
    "Acne",
    "Acne and Rosacea Photos",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos",
    "Bullous Disease Photos",
    "Carcinoma",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema",
    "Eczema Photos",
    "Exanthems and Drug Eruptions",
    "HAM10000 images part 1",
    "HAM10000 images part 2",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos",
    "Keratosis",
    "Light Diseases and Disorders of Pigmentation",
    "Lupus and other Connective Tissue diseases",
    "Melanoma Skin Cancer Nevi and Moles",
    "Milia",
    "Nail Fungus and other Nail Disease",
    "Poison Ivy Photos and other Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Rosacea",
    "Scabies Lyme Disease and other Infestations and Bites",
    "Seborrheic Keratoses and other Benign Tumors",
    "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections",
    "Urticaria Hives",
    "Vascular Tumors",
    "Vasculitis Photos",
    "Warts Molluscum and other Viral Infections"
]

# Map long folder names to clean names
CLEAN_LABELS = {
    "Acne": "Acne",
    "Acne and Rosacea Photos": "Acne & Rosacea",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions": "Actinic Keratosis / Skin Cancer",
    "Atopic Dermatitis Photos": "Atopic Dermatitis",
    "Bullous Disease Photos": "Bullous Disease",
    "Carcinoma": "Carcinoma",
    "Cellulitis Impetigo and other Bacterial Infections": "Bacterial Infections",
    "Eczema": "Eczema",
    "Eczema Photos": "Eczema",
    "Exanthems and Drug Eruptions": "Drug Eruptions",
    "HAM10000 images part 1": "HAM10000 Part 1",
    "HAM10000 images part 2": "HAM10000 Part 2",
    "Hair Loss Photos Alopecia and other Hair Diseases": "Hair Loss / Alopecia",
    "Herpes HPV and other STDs Photos": "Herpes / HPV / STDs",
    "Keratosis": "Keratosis",
    "Light Diseases and Disorders of Pigmentation": "Pigmentation Disorders",
    "Lupus and other Connective Tissue diseases": "Lupus / Connective Tissue",
    "Melanoma Skin Cancer Nevi and Moles": "Melanoma / Nevi / Moles",
    "Milia": "Milia",
    "Nail Fungus and other Nail Disease": "Nail Diseases",
    "Poison Ivy Photos and other Contact Dermatitis": "Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases": "Psoriasis / Lichen Planus",
    "Rosacea": "Rosacea",
    "Scabies Lyme Disease and other Infestations and Bites": "Infestations / Bites",
    "Seborrheic Keratoses and other Benign Tumors": "Seborrheic Keratoses",
    "Systemic Disease": "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections": "Fungal Infections",
    "Urticaria Hives": "Urticaria / Hives",
    "Vascular Tumors": "Vascular Tumors",
    "Vasculitis Photos": "Vasculitis",
    "Warts Molluscum and other Viral Infections": "Warts / Viral Infections"
}

# Short description for each disease
DESCRIPTIONS = {
    "Acne": "Acne is a common skin condition characterized by pimples, blackheads, whiteheads, and sometimes cysts. It often occurs on the face, back, and chest and can be influenced by hormones, diet, and stress.",
    "Acne & Rosacea": "This category includes acne as well as rosacea, which causes facial redness, visible blood vessels, and sometimes acne-like bumps.",
    "Actinic Keratosis / Skin Cancer": "Precancerous lesions and malignant skin tumors caused by sun damage, including basal cell carcinoma and squamous cell carcinoma.",
    "Atopic Dermatitis": "A chronic inflammatory skin condition causing itchy, red, and dry patches, often linked to allergies or genetic factors.",
    "Bullous Disease": "Rare disorders causing large, fluid-filled blisters, which can be inherited or autoimmune.",
    "Carcinoma": "Malignant skin tumors that can grow and spread if untreated.",
    "Bacterial Infections": "Skin infections caused by bacteria such as cellulitis, impetigo, and folliculitis.",
    "Eczema": "Red, itchy, and inflamed skin patches that may ooze or crust, commonly triggered by allergies or irritants.",
    "Drug Eruptions": "Skin reactions resulting from medications, often appearing as rashes, hives, or blisters.",
    "HAM10000 Part 1": "Part of the HAM10000 dataset for various skin lesions.",
    "HAM10000 Part 2": "Continuation of the HAM10000 dataset for skin lesion classification.",
    "Hair Loss / Alopecia": "Conditions leading to hair thinning, bald patches, or total hair loss due to genetics, autoimmune issues, or other causes.",
    "Herpes / HPV / STDs": "Viral infections affecting skin or mucous membranes, including herpes simplex, HPV warts, and other sexually transmitted diseases.",
    "Keratosis": "Thickened, scaly skin patches that can be benign or precancerous.",
    "Pigmentation Disorders": "Changes in skin color including hypopigmentation, hyperpigmentation, or light/dark spots.",
    "Lupus / Connective Tissue": "Autoimmune disorders affecting skin, causing rashes, lesions, and systemic symptoms.",
    "Melanoma / Nevi / Moles": "Abnormal or cancerous moles and skin lesions requiring careful monitoring.",
    "Milia": "Small white cysts commonly appearing on the face, especially around eyes and cheeks.",
    "Nail Diseases": "Fungal infections or other nail disorders causing discoloration, thickening, or brittleness.",
    "Contact Dermatitis": "Skin inflammation caused by contact with irritants or allergens such as poison ivy or chemicals.",
    "Psoriasis / Lichen Planus": "Chronic inflammatory skin diseases causing thick, scaly patches and redness.",
    "Rosacea": "Facial redness, visible blood vessels, and sometimes acne-like bumps, often triggered by heat or stress.",
    "Infestations / Bites": "Skin reactions caused by insect bites, ticks, scabies, or other parasitic infestations.",
    "Seborrheic Keratoses": "Noncancerous skin growths that appear waxy, wart-like, or slightly raised, common in older adults.",
    "Systemic Disease": "Skin symptoms that occur as a result of internal diseases or systemic conditions.",
    "Fungal Infections": "Skin infections caused by fungi such as ringworm, athlete’s foot, or candidiasis.",
    "Urticaria / Hives": "Raised, itchy welts on the skin caused by allergic reactions or other triggers.",
    "Vascular Tumors": "Abnormal growths of blood vessels in the skin, sometimes congenital or benign.",
    "Vasculitis": "Inflammation of blood vessels leading to red or purple skin lesions and potential systemic involvement.",
    "Warts / Viral Infections": "Viral infections causing warts, molluscum, or other lesions on skin."
}

# Generate JSON with name and description
labels_with_desc = []
for folder in folders:
    clean_name = CLEAN_LABELS.get(folder, folder)
    description = DESCRIPTIONS.get(clean_name, "No description available.")
    labels_with_desc.append({
        "name": clean_name,
        "description": description
    })

# Save JSON
os.makedirs("models", exist_ok=True)
with open("models/class_labels.json", "w") as f:
    json.dump(labels_with_desc, f, indent=4)

print("✅ Cleaned class_labels.json generated with descriptions for all diseases.")
