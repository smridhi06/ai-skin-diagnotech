import tensorflow as tf
import torch
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class EnsembleModel:
    """Ensemble of multiple CNN models for skin condition prediction"""
    
    def __init__(self, resnet_path: str, efficientnet_path: str, custom_path: str):
        self.condition_mapping = {
            0: {"name": "Acne Vulgaris", "icd10": "L70.0"},
            1: {"name": "Eczema (Atopic Dermatitis)", "icd10": "L20.9"},
            2: {"name": "Psoriasis", "icd10": "L40.9"},
            3: {"name": "Melanoma", "icd10": "C43.9"},
            4: {"name": "Basal Cell Carcinoma", "icd10": "C44.91"},
            5: {"name": "Seborrheic Keratosis", "icd10": "L82.1"},
            6: {"name": "Fungal Infection (Tinea)", "icd10": "B35.9"},
            7: {"name": "Vitiligo", "icd10": "L80"},
            8: {"name": "Rosacea", "icd10": "L71.9"},
            9: {"name": "Contact Dermatitis", "icd10": "L25.9"},
            10: {"name": "Urticaria (Hives)", "icd10": "L50.9"},
            11: {"name": "Scabies", "icd10": "B86"},
            12: {"name": "Warts", "icd10": "B07.9"},
            13: {"name": "Molluscum Contagiosum", "icd10": "B08.1"},
            14: {"name": "Normal/No Condition", "icd10": "Z00.00"}
        }
        
        # Load models
        logger.info("Loading ResNet50 model...")
        self.resnet_model = tf.keras.models.load_model(resnet_path)
        
        logger.info("Loading EfficientNet model...")
        self.efficientnet_model = tf.keras.models.load_model(efficientnet_path)
        
        logger.info("Loading Custom CNN model...")
        self.custom_model = tf.keras.models.load_model(custom_path)
        
        # Model weights for ensemble voting
        self.weights = {
            'resnet': 0.40,
            'efficientnet': 0.35,
            'custom': 0.25
        }
        
        logger.info("Ensemble model initialized successfully")
    
    def predict(self, image: np.ndarray) -> List[Dict]:
        """
        Predict skin condition using ensemble of models
        
        Args:
            image: Preprocessed image array (224, 224, 3)
        
        Returns:
            List of predictions sorted by confidence
        """
        # Expand dimensions for batch
        image_batch = np.expand_dims(image, axis=0)
        
        # Get predictions from each model
        resnet_pred = self.resnet_model.predict(image_batch, verbose=0)[0]
        efficientnet_pred = self.efficientnet_model.predict(image_batch, verbose=0)[0]
        custom_pred = self.custom_model.predict(image_batch, verbose=0)[0]
        
        # Weighted ensemble
        ensemble_pred = (
            resnet_pred * self.weights['resnet'] +
            efficientnet_pred * self.weights['efficientnet'] +
            custom_pred * self.weights['custom']
        )
        
        # Apply softmax
        ensemble_pred = self._softmax(ensemble_pred)
        
        # Get top predictions
        top_indices = np.argsort(ensemble_pred)[::-1]
        
        results = []
        for idx in top_indices:
            confidence = float(ensemble_pred[idx])
            if confidence > 0.01:  # Only include predictions > 1%
                condition = self.condition_mapping[idx]
                results.append({
                    'name': condition['name'],
                    'confidence': round(confidence, 4),
                    'icd10_code': condition['icd10'],
                    'description': self._get_description(condition['name'])
                })
        
        return results
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Compute softmax values"""
        exp_x = np.exp(x - np.max(x))
        return exp_x / exp_x.sum()
    
    def _get_description(self, condition_name: str) -> str:
        """Get brief description of condition"""
        descriptions = {
            "Acne Vulgaris": "Common skin condition with pimples, blackheads, and inflammation",
            "Eczema (Atopic Dermatitis)": "Inflammatory condition causing itchy, red, dry skin",
            "Psoriasis": "Chronic condition with red, scaly patches",
            "Melanoma": "Serious form of skin cancer - requires immediate attention",
            "Basal Cell Carcinoma": "Most common type of skin cancer",
            "Seborrheic Keratosis": "Benign skin growth, usually brown or black",
            "Fungal Infection (Tinea)": "Infection causing ring-shaped rash",
            "Vitiligo": "Loss of skin pigmentation in patches",
            "Rosacea": "Facial redness and visible blood vessels",
            "Contact Dermatitis": "Skin reaction to allergen or irritant",
            "Urticaria (Hives)": "Itchy, raised welts on skin",
            "Scabies": "Itchy condition caused by mites",
            "Warts": "Small growths caused by viral infection",
            "Molluscum Contagiosum": "Viral infection with small bumps",
            "Normal/No Condition": "No significant skin condition detected"
        }
        return descriptions.get(condition_name, "")