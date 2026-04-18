# 🏥 AI Skin DiagnoTech

> AI-Assisted Diagnostic Support Tool for Common Skin Conditions

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)

---

## 📋 Problem Statement

Dermatological conditions are among the most common health 
complaints in India, yet access to dermatologists is severely 
limited outside urban centres. Patients often self-medicate 
incorrectly due to a lack of accessible preliminary guidance.

**Solution:** A mobile tool where a user can photograph a skin 
condition, answer a short symptom questionnaire, and receive a 
preliminary assessment identifying likely conditions along with 
guidance on whether to seek urgent care.

> ⚕️ **Disclaimer:** This tool provides PRELIMINARY guidance 
> only. It is NOT a substitute for professional medical 
> diagnosis. Always consult a qualified dermatologist.

---

## ✨ Features

- 📸 **AI Image Analysis** - CNN ensemble (ResNet50 + EfficientNet)
- 🎯 **94.2% Accuracy** - Across 15 common skin conditions
- 📝 **Symptom Questionnaire** - Adaptive question flow
- 🚨 **Urgency Classification** - Low/Medium/High with recommendations
- 👨‍⚕️ **Doctor Connect** - Find verified dermatologists nearby
- 🌐 **Multi-lingual** - 10+ Indian languages supported
- 📵 **Offline Mode** - Works on 2G networks
- 🔒 **Privacy First** - Encrypted data, auto-delete after 30 days
- ⚖️ **Responsible AI** - Bias mitigation across Fitzpatrick skin types

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | Web Dashboard |
| Material-UI v5 | UI Components |
| React Router v6 | Navigation |
| Recharts | Data Visualization |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API |
| FastAPI (Python) | ML Microservice |
| Socket.io | Real-time Communication |
| JWT + bcrypt | Authentication |
| Multer + Sharp | Image Processing |

### AI/ML
| Technology | Purpose |
|------------|---------|
| TensorFlow/Keras | Model Training |
| ResNet50 | CNN Model 1 |
| EfficientNetB3 | CNN Model 2 |
| OpenCV + Pillow | Image Processing |
| Ensemble Learning | Multi-model Fusion |

### Database & Cloud
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Primary Database |
| AWS S3 | Image Storage |
| Redis | Caching |

---

## 🏗️ Project Structure