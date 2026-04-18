from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Settings
    API_TITLE: str = "AI Skin DiagnoTech ML Service"
    API_VERSION: str = "1.0.0"
    
    # Model Paths
    RESNET_MODEL_PATH: str = "models/weights/resnet50_skin_v2.h5"
    EFFICIENTNET_MODEL_PATH: str = "models/weights/efficientnet_b3_skin_v2.h5"
    CUSTOM_MODEL_PATH: str = "models/weights/custom_cnn_skin_v1.h5"
    
    # Image Settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".jpg", ".jpeg", ".png"]
    
    # Model Settings
    CONFIDENCE_THRESHOLD: float = 0.5
    TOP_K_PREDICTIONS: int = 5
    
    class Config:
        env_file = ".env"

settings = Settings()