# VERITAS AI: ResNet50 Deepfake Detection Assistant

An enterprise-grade, academic digital forensics platform for detecting facial manipulation in digital video using a **Fine-Tuned ResNet50** deep residual neural network.

Trained and evaluated on the **FaceForensics++** benchmark dataset (c23 compression) with **strict source-video leakage prevention**. The platform features a **FastAPI backend** with GPU-concurrency safety and a **React 18 + Vite + Tailwind CSS** forensic dashboard with frame-by-frame temporal anomaly curves.

---

## 📌 Table of Contents

- [Architectural Overview](#architectural-overview)
- [Empirical Evaluation Results](#empirical-evaluation-results)
- [Data Leakage Audit & Dataset Splits](#data-leakage-audit--dataset-splits)
- [ResNet50 Architecture & Fine-Tuning Strategy](#resnet50-architecture--fine-tuning-strategy)
- [Video Processing & Inference Pipeline](#video-processing--inference-pipeline)
- [Project Directory Structure](#project-directory-structure)
- [Installation & Environment Setup](#installation--environment-setup)
- [Model Evaluation & Inference Commands](#model-evaluation--inference-commands)
- [Running the Application](#running-the-application)
- [REST API Documentation](#rest-api-documentation)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Forensic Limitations & Responsible AI Notice](#forensic-limitations--responsible-ai-notice)

---

## 🏗️ Architectural Overview

```
                          Uploaded Video (MP4 / MOV / AVI / MKV)
                                             │
                                             ▼
                             [OpenCV Uniform Frame Sampler]
                               (Up to 20 frames sampled)
                                             │
                                             ▼
                             [Haar Cascade Face Localizer]
                              (Largest face box detected)
                                             │
                                             ▼
                               [Shared Face ROI Extractor]
                             (BGR to RGB, Normalized Crop)
                                             │
                                             ▼
                               [ResNet50 Preprocessing]
                                   Resize: 224×224×3
                               Zero-center caffe scaling
                                             │
                                             ▼
                               [Fine-Tuned ResNet50]
                             (Residual Skip-Connections)
                                             │
                                             ▼
                               [Video-Level Aggregation]
                        (Mean REAL score, FAKE score, Confidence)
                                             │
                                             ▼
                             [React 18 Forensic Dashboard]
                    (Classification Badge, Temporal Anomaly Curve,
                          Sampled Frame Breakdown Table)
```

---

## 📊 Empirical Evaluation Results

Both the initial baseline ResNet50 (frozen backbone) and the fine-tuned ResNet50 (top 30 layers unfrozen) were evaluated on the **identical 200 held-out test split face crops** (100 Real, 100 Fake) from source videos never seen during training or validation.

| Metric | Baseline ResNet50 (Frozen Backbone) | Fine-Tuned ResNet50 (Active Model) | Impact of Fine-Tuning |
| :--- | :---: | :---: | :---: |
| **ROC-AUC Score** | 75.58% | **78.53%** | **+2.95% Gain** |
| **Recall (Real Class)** | 55.00% | **61.00%** | **+6.00% Gain** |
| **F1-Score (Real Class)** | 64.33% | **65.95%** | **+1.62% Gain** |
| **Precision (Real Class)** | 77.46% | **71.76%** | Balanced distribution |
| **Overall Accuracy** | 69.50% | **68.50%** | Higher real sensitivity |
| **False Fakes (Misclassified Real Faces)** | 45 / 100 | **39 / 100** | **13.3% Error Reduction** |
| **Model Size** | 93.62 MB | **203.71 MB** | Full optimizer states |

### Key Takeaway
The initial frozen ResNet50 suffered from an overly conservative bias, misclassifying 45% of genuine faces as fake. Fine-tuning the upper 30 residual blocks significantly lowered false fake errors to 39%, resulting in a **+6.00% increase in Real Recall** and a **+2.95% boost in ROC-AUC discriminative ability**.

---

## 🔒 Data Leakage Audit & Dataset Splits

### FaceForensics++ Dataset Details & Download
- **Dataset:** FaceForensics++ (c23 compression)
- **Official Repository & Access:** [https://github.com/ondyari/FaceForensics](https://github.com/ondyari/FaceForensics)
- **Paper:** *FaceForensics++: Learning to Detect Manipulated Facial Images* (Rossler et al., ICCV 2019)
- **Automated Download Script:** Included in the project root as [`faceforensics_download_data.py`](faceforensics_download_data.py). Request access via the official repository's Google Form to obtain the download credentials.

Standard random frame-level splitting causes severe data leakage: frames from the same video share identical lighting, backgrounds, and facial geometry. Our dataset manager (`src/prepare_dataset.py`) groups connected components of original and manipulated video IDs so that no identity or scene appears across more than one split.

### Verified Audit Results:
- **Train Split:** 34 distinct video IDs (338 Real / 337 Fake crops)
- **Validation Split:** 6 distinct video IDs (60 Real / 60 Fake crops)
- **Held-Out Test Split:** 10 distinct video IDs (100 Real / 100 Fake crops)
- **Train ∩ Test Overlap:** **0 (Zero Leakage)**
- **Val ∩ Test Overlap:** **0 (Zero Leakage)**

---

## 🧠 ResNet50 Architecture & Fine-Tuning Strategy

- **Backbone:** ResNet50 initialized with ImageNet pretrained weights (`include_top=False`).
- **Input Dimensions:** 224 × 224 × 3.
- **Preprocessing:** Caffe zero-centering (`tensorflow.keras.applications.resnet50.preprocess_input`).
- **Classification Head:** `GlobalAveragePooling2D` → `Dense(128, activation='relu')` → `Dropout(0.4)` → `Dense(1, activation='sigmoid')`.
- **Training Strategy:**
  1. *Transfer Learning Stage:* Frozen ResNet50 backbone, training the classification head using Adam optimizer (`lr=1e-3`) with early stopping.
  2. *Fine-Tuning Stage:* Unfroze the final 30 convolutional layers with `Adam(lr=1e-5)` while locking `BatchNormalization` layers to maintain numerical stability on face crops.
- **Checkpoints:**
  - `models/deepfake_resnet50_finetuned.keras` (Primary active model)
  - `models/deepfake_resnet50.keras` (Baseline model)

---

## 🔄 Video Processing & Inference Pipeline

The video processing service (`backend/services/video_processor.py`):
1. **Container Validation:** Verifies video container readability, codec compatibility, and frame count.
2. **Uniform Temporal Sampling:** Uniformly extracts up to 20 representative frames across the entire duration.
3. **Face Localization:** Uses OpenCV Haar Cascade (`haarcascade_frontalface_default.xml`) to detect facial regions, selecting the largest face box per sampled frame.
4. **Color Conversion & Normalization:** Converts BGR to RGB, resizes to 224×224, and applies ResNet50 zero-center preprocessing.
5. **Thread-Safe GPU Inference:** Uses `threading.Lock()` to serialize GPU inference and avoid CUDA out-of-memory errors during concurrent requests.

---

## 📁 Project Directory Structure

```
Deepfake-Detection-Assistant/
├── data/
│   ├── raw/                             # Original & manipulated video sequences
│   ├── processed/                       # Full-resolution extracted frames
│   ├── faces/                           # Cropped face images (real / fake)
│   └── splits/                          # Source-video partitioned splits
│       ├── train/ {real, fake}
│       ├── val/ {real, fake}
│       └── test/ {real, fake}
│
├── models/
│   ├── deepfake_resnet50.keras          # Original ResNet50 checkpoint
│   ├── deepfake_resnet50_finetuned.keras # Fine-tuned ResNet50 primary checkpoint
│   └── haarcascades/                    # Face detection cascades
│
├── src/
│   ├── prepare_dataset.py               # Leakage-free video grouping and split generation
│   ├── extract_frames.py                # Frame extraction utility
│   ├── face_detection.py                # Haar cascade face extraction utility
│   ├── train_model.py                   # ResNet50 initial training
│   ├── finetune_model.py                # ResNet50 fine-tuning
│   ├── evaluate_model.py                # ResNet50 test split evaluation
│   └── predict_video.py                 # ResNet50 standalone video prediction CLI
│
├── backend/
│   ├── main.py                          # FastAPI application & startup lifespan
│   ├── config.py                        # Centralized configuration & settings
│   ├── routes/
│   │   ├── health.py                    # GET /api/health
│   │   ├── analyze.py                   # POST /api/analyze
│   │   └── metrics.py                   # GET /api/metrics
│   ├── services/
│   │   ├── model_loader.py              # Singleton model & detector manager
│   │   ├── inference.py                 # Thread-safe ResNet50 inference
│   │   └── video_processor.py           # OpenCV frame sampling & face cropping
│   ├── schemas/
│   │   └── response.py                  # Pydantic response models
│   └── utils/
│       └── file_validation.py           # Upload file format & size validation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx               # Header with live system & GPU status
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Overview & project introduction
│   │   │   ├── VideoAnalysisPage.jsx    # Drag-and-drop upload & progress
│   │   │   ├── ForensicDashboard.jsx    # ResNet50 classification & anomaly curves
│   │   │   ├── ModelPerformancePage.jsx # Test benchmarks & fine-tuning gains
│   │   │   └── AboutPage.jsx            # Technical documentation & limitations
│   │   ├── services/
│   │   │   └── api.js                   # Axios client connecting to FastAPI
│   │   ├── App.jsx                      # Main application layout
│   │   └── index.css                    # Tailwind CSS directives
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite configuration
│   └── tailwind.config.js               # Tailwind theme configuration
│
├── outputs/
│   ├── resnet50_results.json            # Verified fine-tuned ResNet50 test metrics
│   ├── resnet50_benchmark.json          # Baseline vs fine-tuned comparison
│   └── test_results.json                # Test evaluation results
│
├── reports/                             # Evaluation artifacts
├── tests/
│   └── test_backend.py                  # Pytest backend unit & integration tests
├── requirements.txt                     # Python dependencies
└── README.md                            # Comprehensive documentation
```

---

## ⚙️ Installation & Environment Setup

### 1. Prerequisites
- Python 3.10–3.13 (or active virtualenv)
- Node.js 18+ and npm
- (Optional) NVIDIA GPU with CUDA support

### 2. Python Environment Setup
```bash
cd Deepfake-Detection-Assistant
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## 🏋️ Model Evaluation & Inference Commands

### Evaluate ResNet50 on Held-Out Test Split
```bash
python src/evaluate_model.py
```

### Standalone CLI Video Inference
```bash
python src/predict_video.py path/to/sample.mp4
```

---

## 🚀 Running the Web Application

The application consists of a FastAPI backend and a React + Vite frontend. **Run both commands in separate terminal windows:**

### Terminal 1: Start the FastAPI Backend
```bash
# From project root
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
*API is hosted at `http://localhost:8000`. Interactive OpenAPI documentation available at `http://localhost:8000/docs`.*

### Terminal 2: Start the React Frontend
```bash
# In a new terminal tab/window
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
*Open `http://localhost:5173` in your browser to access the forensic dashboard.*

---

## 📡 REST API Documentation

### 1. Health & Status Check
- **Endpoint:** `GET /api/health`
- **Response:**
```json
{
  "status": "healthy",
  "resnet50_loaded": true,
  "face_detector_loaded": true,
  "gpu_available": true,
  "gpu_devices": ["/physical_device:GPU:0"],
  "model_name": "ResNet50 (Fine-Tuned)",
  "model_version": "Transfer Learning on FaceForensics++"
}
```

### 2. Model Benchmark Metrics
- **Endpoint:** `GET /api/metrics`
- **Description:** Returns the verified FaceForensics++ test split metrics comparing baseline vs fine-tuned ResNet50.

### 3. ResNet50 Video Analysis
- **Endpoint:** `POST /api/analyze`
- **Content-Type:** `multipart/form-data`
- **Parameters:** `file` (Video: `.mp4`, `.mov`, `.avi`, `.mkv`, max 100MB)
- **Response Structure:**
```json
{
  "success": true,
  "video_name": "sample_video.mp4",
  "frames_processed": 20,
  "faces_detected": 18,
  "prediction": "REAL",
  "real_score": 0.8421,
  "fake_score": 0.1579,
  "confidence_score": 0.8421,
  "threshold": 0.5,
  "summary": "ResNet50 classified this video as REAL with 84.2% confidence across 18 analyzed face crops.",
  "frame_analysis": [
    {
      "frame_index": 0,
      "real_score": 0.8123,
      "fake_score": 0.1877,
      "prediction": "REAL"
    }
  ]
}
```

---

## 🧪 Testing & Quality Assurance

Run the comprehensive pytest suite verifying model loading, health endpoints, file validation, error handling, and end-to-end video inference:
```bash
pytest tests/test_backend.py -v
```

All 6 test suites verify:
- ✅ Fast root response and API prefix
- ✅ Live ResNet50 model initialization and GPU device detection
- ✅ Correct benchmark retrieval from test splits
- ✅ Rejection of non-video file formats (HTTP 400)
- ✅ Rejection of corrupted video headers (HTTP 422)
- ✅ Live end-to-end inference on video with OpenCV and ResNet50

---

## ⚖️ Forensic Limitations & Responsible AI Notice

- **Probabilistic Nature:** Deep learning classifiers estimate authenticity based on statistical spatial patterns. They do not constitute absolute legal certainty.
- **Compression Sensitivity:** Low-bitrate compression introduces compression artifacts that can mask synthetic manipulation boundaries.
- **Occlusion and Pose:** Severe face angles or partial occlusions may prevent face detection or distort confidence estimates.
- **Ethical Use:** This system is developed strictly for digital media integrity verification, academic research, and counter-disinformation efforts.
