import numpy as np
from PIL import Image
import cv2
from typing import Tuple

def preprocess_image(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """
    Preprocess image for model input
    
    Args:
        image: PIL Image object
        target_size: Target dimensions (height, width)
    
    Returns:
        Preprocessed numpy array
    """
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize
    image = image.resize(target_size, Image.Resampling.LANCZOS)
    
    # Convert to numpy array
    img_array = np.array(image)
    
    # Normalize to [0, 1]
    img_array = img_array.astype(np.float32) / 255.0
    
    # Additional preprocessing
    img_array = enhance_image(img_array)
    
    return img_array

def enhance_image(image: np.ndarray) -> np.ndarray:
    """Apply enhancement techniques"""
    # Convert to uint8 for OpenCV operations
    img_uint8 = (image * 255).astype(np.uint8)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    lab = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
    
    # Convert back to float [0, 1]
    return enhanced.astype(np.float32) / 255.0

def augment_image(image: np.ndarray) -> np.ndarray:
    """Apply data augmentation (for training)"""
    import albumentations as A
    
    transform = A.Compose([
        A.RandomRotate90(p=0.5),
        A.Flip(p=0.5),
        A.RandomBrightnessContrast(p=0.3),
        A.GaussNoise(p=0.2),
        A.HueSaturationValue(p=0.3),
    ])
    
    augmented = transform(image=image)
    return augmented['image']