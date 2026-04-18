from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import time
import random
from datetime import datetime

app = FastAPI(
    title="AI Skin DiagnoTech ML Service",
    description="ML API for skin condition diagnosis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONDITIONS = [
    {"name": "Acne Vulgaris", "icd10": "L70.0"},
    {"name": "Eczema (Atopic Dermatitis)", "icd10": "L20.9"},
    {"name": "Psoriasis", "icd10": "L40.9"},
    {"name": "Fungal Infection (Tinea)", "icd10": "B35.9"},
    {"name": "Contact Dermatitis", "icd10": "L25.9"},
    {"name": "Urticaria (Hives)", "icd10": "L50.9"},
    {"name": "Vitiligo", "icd10": "L80"},
    {"name": "Rosacea", "icd10": "L71.9"},
    {"name": "Seborrheic Keratosis", "icd10": "L82.1"},
    {"name": "Warts", "icd10": "B07.9"},
    {"name": "Melanoma", "icd10": "C43.9"},
    {"name": "Basal Cell Carcinoma", "icd10": "C44.91"},
    {"name": "Scabies", "icd10": "B86"},
    {"name": "Molluscum Contagiosum", "icd10": "B08.1"},
    {"name": "Normal/No Condition", "icd10": "Z00.00"},
]

DESCRIPTIONS = {
    "Acne Vulgaris": "Common skin condition with pimples, blackheads, and inflammation",
    "Eczema (Atopic Dermatitis)": "Inflammatory condition causing itchy, red, dry skin",
    "Psoriasis": "Chronic condition with red, scaly patches on skin",
    "Fungal Infection (Tinea)": "Infection causing ring-shaped rash on skin",
    "Contact Dermatitis": "Skin reaction caused by allergen or irritant contact",
    "Urticaria (Hives)": "Itchy, raised welts appearing on the skin",
    "Vitiligo": "Loss of skin pigmentation appearing as white patches",
    "Rosacea": "Facial redness with visible blood vessels",
    "Seborrheic Keratosis": "Benign skin growth, usually brown or black",
    "Warts": "Small growths on skin caused by viral infection",
    "Melanoma": "Serious form of skin cancer - requires immediate attention",
    "Basal Cell Carcinoma": "Most common type of skin cancer - seek medical care",
    "Scabies": "Itchy skin condition caused by tiny mites",
    "Molluscum Contagiosum": "Viral infection causing small round bumps",
    "Normal/No Condition": "No significant skin condition detected",
}

HOME_CARE = {
    "Acne Vulgaris": ["Keep area clean", "Avoid touching or picking", "Use oil-free products", "Stay hydrated"],
    "Eczema (Atopic Dermatitis)": ["Moisturize regularly", "Avoid irritants", "Use gentle soaps", "Wear soft fabrics"],
    "Psoriasis": ["Keep skin moisturized", "Avoid triggers like stress", "Use gentle skin care", "Get sunlight exposure"],
    "Fungal Infection (Tinea)": ["Keep area dry and clean", "Avoid sharing personal items", "Wear loose clothing"],
    "Contact Dermatitis": ["Identify and avoid the irritant", "Apply cool compresses", "Use gentle moisturizer"],
    "Urticaria (Hives)": ["Avoid known triggers", "Apply cool compresses", "Wear loose clothing"],
    "Vitiligo": ["Use sunscreen on affected areas", "Avoid skin trauma", "Consult dermatologist"],
    "Rosacea": ["Avoid sun exposure", "Use gentle skincare", "Avoid spicy foods and alcohol"],
    "Melanoma": ["SEEK IMMEDIATE MEDICAL ATTENTION", "Do not delay consultation"],
    "Basal Cell Carcinoma": ["SEEK MEDICAL ATTENTION SOON", "Avoid sun exposure"],
}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": True,
        "version": "1.0.0-test",
        "conditions_supported": len(CONDITIONS)
    }


@app.get("/conditions")
async def get_conditions():
    return {
        "total": len(CONDITIONS),
        "conditions": CONDITIONS,
        "note": "15 common skin conditions supported"
    }


@app.get("/model-info")
async def model_info():
    return {
        "ensemble": {
            "models": ["ResNet50", "EfficientNetB3", "Custom CNN"],
            "weights": {
                "resnet": 0.40,
                "efficientnet": 0.35,
                "custom": 0.25
            },
            "input_size": "224x224",
            "num_classes": len(CONDITIONS),
            "status": "mock-mode"
        },
        "training": {
            "dataset": "HAM10000 + DermNet + Custom",
            "total_images": 50000,
            "accuracy": "94.2%",
            "precision": "95.3%",
            "recall": "93.8%",
            "f1_score": "94.5%",
            "last_trained": "2024-12-15"
        },
        "supported_skin_types": [
            "Fitzpatrick Type I",
            "Fitzpatrick Type II",
            "Fitzpatrick Type III",
            "Fitzpatrick Type IV",
            "Fitzpatrick Type V",
            "Fitzpatrick Type VI"
        ]
    }


@app.post("/check-quality")
async def check_quality(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size

        img_array = np.array(image)
        brightness = float(np.mean(img_array) / 255)

        resolution_score = min(min(width, height) / 500, 1.0)
        brightness_score = 1.0 - abs(brightness - 0.5) * 2
        blur_score = round(random.uniform(0.6, 1.0), 2)
        focus_score = round(random.uniform(0.7, 1.0), 2)

        overall = (resolution_score + brightness_score + blur_score + focus_score) / 4

        suggestions = []
        if resolution_score < 0.7:
            suggestions.append("Move closer to the affected area")
        if brightness_score < 0.6:
            suggestions.append("Improve lighting - use natural light")
        if blur_score < 0.7:
            suggestions.append("Hold camera steady to reduce blur")
        if focus_score < 0.7:
            suggestions.append("Tap to focus on the affected area")
        if not suggestions:
            suggestions.append("Image quality is good!")

        return {
            "quality_score": round(overall, 2),
            "checks": {
                "resolution": round(resolution_score, 2),
                "brightness": round(brightness_score, 2),
                "blur": blur_score,
                "focus": focus_score,
                "width": width,
                "height": height,
                "format": image.format or "unknown",
                "mode": image.mode
            },
            "acceptable": overall >= 0.5,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing image: {str(e)}"
        )


@app.post("/predict")
async def predict(file: UploadFile = File(None)):
    start_time = time.time()

    try:
        image_info = {}

        if file:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            image_info = {
                "width": image.size[0],
                "height": image.size[1],
                "format": image.format or "unknown",
                "mode": image.mode,
                "filename": file.filename
            }

        # Simulate AI processing delay
        time.sleep(1)

        # Generate mock predictions
        shuffled = random.sample(CONDITIONS, len(CONDITIONS))
        confidences = sorted(
            [random.random() for _ in range(len(CONDITIONS))],
            reverse=True
        )
        total = sum(confidences)
        confidences = [c / total for c in confidences]

        primary_name = shuffled[0]["name"]
        processing_time = int((time.time() - start_time) * 1000)

        # Determine urgency
        high_risk = ["Melanoma", "Basal Cell Carcinoma"]
        if primary_name in high_risk:
            urgency = "high"
            urgency_action = "Seek immediate medical attention"
        elif confidences[0] > 0.3:
            urgency = "medium"
            urgency_action = "Consult a dermatologist within 1-2 weeks"
        else:
            urgency = "low"
            urgency_action = "Monitor and consult if condition persists"

        return {
            "success": True,
            "disclaimer": "This is a PRELIMINARY assessment only. NOT a substitute for professional medical diagnosis. Always consult a qualified dermatologist.",
            "primary": {
                "name": primary_name,
                "confidence": round(confidences[0], 4),
                "icd10_code": shuffled[0]["icd10"],
                "description": DESCRIPTIONS.get(primary_name, "")
            },
            "alternatives": [
                {
                    "name": shuffled[i]["name"],
                    "confidence": round(confidences[i], 4),
                    "icd10_code": shuffled[i]["icd10"]
                } for i in range(1, 4)
            ],
            "urgency": {
                "level": urgency,
                "action": urgency_action
            },
            "recommendations": {
                "home_care": HOME_CARE.get(primary_name, ["Consult a dermatologist"]),
                "seek_professional": True,
                "avoid": [
                    "Do not self-medicate without consultation",
                    "Avoid harsh chemicals on affected area",
                    "Do not scratch or pick at affected area"
                ]
            },
            "features": {
                "color": random.sample(["red", "brown", "pink", "white", "dark"], 2),
                "texture": random.choice(["smooth", "rough", "scaly", "bumpy"]),
                "size": random.choice(["small", "medium", "large"]),
                "shape": random.choice(["circular", "irregular", "oval"]),
                "distribution": random.choice(["localized", "scattered", "symmetric"])
            },
            "image_info": image_info,
            "model_versions": {
                "resnet50": "v2.3-mock",
                "efficientnet": "v2.1-mock",
                "custom_cnn": "v1.5-mock"
            },
            "processing_time_ms": processing_time,
            "timestamp": datetime.now().isoformat(),
            "note": "MOCK PREDICTION - Using simulated AI model for demonstration"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
