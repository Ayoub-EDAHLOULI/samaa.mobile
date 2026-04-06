# 📱 Samaa Mobile App (سماع)

The official mobile client for **Samaa**, an AI-powered "Shazam for the Quran." This application allows users to record audio of a Quranic recitation, send it to our machine learning microservice, and instantly discover the identity of the Qari (reciter). 

This repository is part of the broader Samaa ecosystem and acts as the primary user interface, connecting seamlessly to the [Samaa Backend](https://github.com/Ayoub-EDAHLOULI/samaa.backend) and the [Samaa AI Engine](https://github.com/Ayoub-EDAHLOULI/samaa.ai).

## 🚀 Tech Stack

* **Framework:** React Native & Expo
* **Language:** TypeScript
* **Audio Processing:** `expo-av`
* **Secure Storage:** `expo-secure-store`
* **Networking:** Axios
* **Navigation:** React Navigation

## ✨ Key Features

1. **One-Tap Recognition:** High-fidelity audio recording optimized for acoustic feature extraction.
2. **Discovery History:** View past recognized Qaris, seamlessly synced with the PostgreSQL backend.
3. **Favorites Library:** Save your favorite reciters for easy access to their Spotify/YouTube profiles.
4. **Guest Mode:** Frictionless onboarding allowing users to identify audio without creating an account first.

## 💻 Local Development Setup

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Expo Go](https://expo.dev/client) app installed on your iOS or Android device

### 2. Clone and Install
```bash
git clone [https://github.com/Ayoub-EDAHLOULI/samaa.mobile.git](https://github.com/Ayoub-EDAHLOULI/samaa.mobile.git)
cd samaa.mobile

# Install all dependencies
npm install
