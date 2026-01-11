# VocalHands 🤟

**Real-time Sign Language Detection using MediaPipe and KNN**

VocalHands is a sign language recognition system that uses computer vision to detect hand signs and translate them into text in real-time. It leverages MediaPipe for hand landmark detection and a K-Nearest Neighbors (KNN) classifier for sign classification.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8+-green.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10+-orange.svg)

---

## ✨ Features

- **Real-time Detection**: Live webcam-based sign language recognition
- **MediaPipe Integration**: Accurate 21-point hand landmark detection
- **KNN Classification**: Simple yet effective machine learning model
- **Sentence Building**: Automatically builds sentences from detected signs
- **Data Collection Tool**: Interactive interface to collect training data
- **Cross-platform**: Works on Windows, macOS, and Linux

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Training Data

#### Option A: Use Kaggle ASL Alphabet Dataset (Recommended)

1. Download the dataset from: https://www.kaggle.com/datasets/grassknoted/asl-alphabet/data
2. Extract the zip file to the `VocalHands` folder (or anywhere you prefer)
3. Run the processing script:

```bash
# If extracted to VocalHands folder:
python process_kaggle_dataset.py

# Or specify the path:
python process_kaggle_dataset.py --dataset_path "C:/path/to/asl_alphabet_train"

# Process specific signs only:
python process_kaggle_dataset.py --signs A B C D E

# Limit samples per sign:
python process_kaggle_dataset.py --max_samples 300
```

#### Option B: Collect Your Own Data

```bash
python collect_data.py
```

**Controls:**

- `SPACE` - Start/Stop recording samples
- `N` - Next sign
- `P` - Previous sign
- `S` - Save progress
- `Q` - Quit and save

### 3. Train the Model

```bash
python train_model.py
```

### 4. Run Real-time Detection

```bash
python detect_signs.py
```

**Controls:**

- `Q` - Quit
- `C` - Clear sentence
- `SPACE` - Add space to sentence
- `BACKSPACE` - Delete last character

---

## 📁 Project Structure

```
VocalHands/
├── config.py                  # Configuration settings
├── process_kaggle_dataset.py  # Process Kaggle ASL dataset
├── collect_data.py            # Manual data collection script
├── train_model.py             # Model training script
├── detect_signs.py            # Real-time detection script
├── create_sample_dataset.py   # Generate test data
├── requirements.txt           # Python dependencies
├── README.md                  # This file
├── utils/
│   ├── __init__.py
│   └── hand_detector.py       # MediaPipe hand detection utilities
├── dataset/                   # Training data (auto-created)
│   ├── A/
│   │   ├── landmarks.npy      # NumPy array of landmarks
│   │   └── metadata.json      # Sample metadata
│   ├── B/
│   └── ...
├── models/                    # Trained models
│   ├── knn_sign_model.pkl
│   └── model_info.json
└── logs/                      # Application logs
```

---

## 🔧 How It Works

### 1. Hand Landmark Detection

MediaPipe Hands detects 21 3D landmarks on each hand:

```
         8   12  16  20
         |   |   |   |
     7   11  15  19  |
     |   |   |   |   |
     6   10  14  18  |
     |   |   |   |   |
     5---9---13--17--+
          \         |
           \        |
        4   \       |
        |    \      |
        3     \     |
        |      \    |
        2       \   |
        |        \  |
        1---------0-+
              WRIST
```

Each landmark has (x, y, z) coordinates = **63 features per hand**.

### 2. Feature Normalization

Landmarks are normalized for:

- **Position invariance**: Centered around the wrist
- **Scale invariance**: Normalized by palm size

### 3. KNN Classification

The K-Nearest Neighbors algorithm:

1. Stores all training samples in memory
2. For new input, finds K closest training samples
3. Predicts the most common class among neighbors

**Why KNN for Sign Language?**

- Simple and interpretable
- No training time (lazy learning)
- Works well with normalized hand landmarks
- Easy to update with new signs

---

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# Signs to detect (add/remove as needed)
SIGNS = ["A", "B", "C", ...]

# Samples per sign for training
SAMPLES_PER_SIGN = 100

# KNN parameters
KNN_N_NEIGHBORS = 5
KNN_WEIGHTS = "distance"

# Detection thresholds
CONFIDENCE_THRESHOLD = 0.6
```

---

## 📊 Dataset Format

Each sign's data is stored in `dataset/{SIGN}/`:

**landmarks.npy**: NumPy array of shape `(N, 63)` where:

- N = number of samples
- 63 = 21 landmarks × 3 coordinates (x, y, z)

**metadata.json**:

```json
{
  "sign": "A",
  "num_samples": 100,
  "features_per_sample": 63,
  "last_updated": "2024-01-01T12:00:00"
}
```

---

## 📦 Using the Kaggle ASL Dataset

The recommended way to get training data is using the **Kaggle ASL Alphabet** dataset:

**Dataset**: https://www.kaggle.com/datasets/grassknoted/asl-alphabet/data

**Contents**:

- ~87,000 images (200x200 pixels)
- 29 classes: A-Z + space, delete, nothing
- ~3,000 images per class

**Processing Pipeline**:

1. Download and extract the dataset
2. `process_kaggle_dataset.py` reads each image
3. MediaPipe extracts 21 hand landmarks per image
4. Normalized landmarks (63 features) are saved as NumPy arrays
5. Ready for KNN training!

```bash
# Full processing (all 26 letters, up to 500 samples each)
python process_kaggle_dataset.py --dataset_path "path/to/asl_alphabet_train"

# Quick test (fewer samples for faster processing)
python process_kaggle_dataset.py --max_samples 100
```

---

## 🧪 Testing with Synthetic Data

To test the pipeline without any dataset:

```bash
python create_sample_dataset.py
python train_model.py
```

⚠️ **Note**: Synthetic data is only for testing the pipeline. Use the Kaggle dataset or collect real data for actual sign detection.

---

## 📈 Improving Accuracy

1. **Collect More Data**: Aim for 200+ samples per sign
2. **Data Augmentation**: Vary hand positions and orientations
3. **Multiple Users**: Collect from different people
4. **Consistent Lighting**: Ensure good lighting conditions
5. **Tune K Value**: The training script auto-tunes, but you can adjust

---

## 🌐 Supported Signs

Default configuration includes:

**ASL Alphabet:**
A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z

**Common Words:**
HELLO, THANKS, YES, NO, PLEASE

Customize in `config.py` by modifying the `SIGNS` list.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) - Hand landmark detection
- [OpenCV](https://opencv.org/) - Computer vision library
- [scikit-learn](https://scikit-learn.org/) - Machine learning library

---

## 📞 Troubleshooting

**Camera not detected:**

- Check camera permissions
- Try different `CAMERA_INDEX` in config.py (0, 1, 2...)

**Low accuracy:**

- Ensure good lighting
- Position hand clearly in frame
- Collect more training samples
- Try different K values

**Model not found:**

- Run `python train_model.py` first
- Check `models/` directory exists

---

Made with ❤️ for accessibility
