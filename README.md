# 🎤 VocalHands — Real-Time Sign to Speech

**VocalHands** is a browser-based accessibility tool that converts sign language gestures into spoken sentences in real time using computer vision and AI.

Built for **Journey Hacks**, VocalHands demonstrates how hand gestures captured through a webcam can be transformed into natural speech without any special hardware.

---

## 🚀 Features

- Live webcam hand tracking using **MediaPipe Hands**
- Custom gesture recognition (no black-box classifier)
- Real-time sentence building with stability filtering
- AI-powered grammar cleanup using **Gemini**
- Built-in browser text-to-speech output
- Visual hand landmark overlay for live feedback
- Special presentation macro gesture 🤘 for demo intro

---

## 🧠 How It Works

1. Webcam captures live video  
2. MediaPipe detects 21 hand landmarks per frame  
3. Landmark distances determine which fingers are “up” or curled  
4. Stable gestures are converted into words  
5. Words are buffered into sentences  
6. Gemini cleans grammar  
7. Browser speaks the final sentence

---

## 🖐 Supported Gestures

| Gesture | Output |
|-------|--------|
| ✋ Open Palm | HELLO |
| ✊ Fist | STOP |
| ☝️ Index only | YOU |
| ✌️ Peace sign | THANK YOU |
| 🤘 Thumb + Index + Pinky | Intro sentence macro |

---

## 🧪 Demo Macro Gesture 🤘

Hold 🤘 for ~1 second to trigger:

> *Hi, we are VocalHands. This is our project for Journey Hacks. This is a live demo.*

---

## ⚙️ Setup

```bash
cd frontend
npm install
npm run dev
