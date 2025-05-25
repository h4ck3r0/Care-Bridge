# 🏥 Healthcare Platform

A comprehensive, AI-powered healthcare platform that connects patients with doctors and hospitals. It includes real-time appointment and queue management, disease prediction using machine learning, and a chat interface for instant communication.

---

## 📁 Project Structure

The application consists of two main components:

- **Client** – React frontend built with **Vite**
- **Server** – Node.js backend integrated with **Python** for ML-based disease prediction

---

## 🚀 Features

- 🔐 **User Authentication** – Secure registration and login system  
- 🧑‍⚕️ **Doctor & Hospital Search** – Filter by specialty or location  
- 📅 **Appointment Management** – Book and manage appointments  
- ⏱️ **Real-Time Queue System** – Live status updates for patient queues  
- 🧠 **Disease Prediction** – AI model analyzes symptoms and predicts possible diseases  
- 💬 **Chat Functionality** – Instant communication between patients and healthcare providers  

---

## 🧰 Technical Stack

### Frontend (Client)
- **React** with **React Router**
- **Vite** for fast development and build
- **Context API** for state management
- **Socket.io** for real-time communication
- **CSS** for UI styling

### Backend (Server)
- **Node.js** with **Express.js** framework
- **Socket.io** for real-time data exchange
- **Python** ML microservice for disease prediction
- **Adapter Pattern** to support flexible integration with AI modules

### AI Integration
- Disease prediction using trained **machine learning models**
- Models stored as `.pkl` (Pickle) files
- REST API communication between Node.js and Python ML service

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/healthcare-platform.git
cd healthcare-platform
````

### 2. Set up the Client

```bash
cd client
npm install
npm run dev
```

### 3. Set up the Server

```bash
cd server
npm install
node server.js
```

### 4. Set up the ML Server

```bash
cd server
# Optional: Create a virtual environment
# python -m venv venv
# source venv/bin/activate  (Linux/Mac)
# venv\Scripts\activate     (Windows)

python ml-server.py
```

✅ **Important**: Configure `.env` files for both `client/` and `server/` directories with necessary API keys, database URLs, and environment settings.

---

## 🧩 Key Components

| Component          | Description                                        |
| ------------------ | -------------------------------------------------- |
| Authentication     | Handles user sign-up, login, session management    |
| Dashboard          | Personalized user dashboard for appointments, etc  |
| Doctor Search      | Filter by name, specialty, rating, or location     |
| Hospital Search    | Lookup nearby hospitals or clinics                 |
| Appointments       | Create, view, reschedule, or cancel appointments   |
| Queue Management   | Real-time waiting list updates for patients        |
| Disease Prediction | AI-based symptom checker and diagnostic suggestion |

---

## 🛠️ API Services

The backend uses an **adapter pattern** to abstract the ML model interaction, allowing:

* Easy integration with various ML frameworks
* Swappable implementations for disease prediction models
* Clear separation between business logic and prediction logic

---


