# 💧 Smart Water Level Monitoring System

![IoT](https://img.shields.io/badge/IoT-ESP32-blue)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![License](https://img.shields.io/badge/License-MIT-orange)

A **full-stack IoT system** that monitors the **water level of overhead tanks in real time** using **ESP32 and an Ultrasonic Sensor**, with a **React web dashboard** and **MongoDB Atlas cloud database**.

The ESP32 measures the water level and sends the data to a backend API. The backend stores it in MongoDB Atlas and the **web dashboard displays the tank status in real time**.

---

# 🌐 Live Demo

Dashboard:  
https://water-level-monitor-sandy.vercel.app

---

# 📸 Screenshots

## Login Page
![Login Screenshot](screenshots/login.png)

## Dashboard
![Dashboard Screenshot](screenshots/dashboard.png)

---

# 🏗 System Architecture

Ultrasonic Sensor │ ▼ ESP32 (WiFi Enabled) │ HTTP POST Request │ ▼ Express.js API │ ▼ MongoDB Atlas │ ▼ React Dashboard

---

# 🚀 Features

- Real-time water level monitoring
- ESP32 WiFi data transmission
- React web dashboard
- Cloud database using MongoDB Atlas
- Tank ID based monitoring
- REST API integration
- Deployed frontend using Vercel
- Expandable IoT architecture

---

# 🧰 Tech Stack

## Hardware

- ESP32
- HC-SR04 Ultrasonic Sensor
- Jumper wires
- Water tank

## Software

### Frontend
- React (Vite)
- Axios
- CSS / Tailwind

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### IoT Firmware
- Arduino IDE
- ESP32 WiFi Library
- HTTPClient

---

# 📁 Project Structure
```
water-level-monitoring-system
│
├── esp32
│   ├── water_level_monitor.ino
│   └── config.h
│
├── backend
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   └── tankController.js
│   │
│   ├── models
│   │   └── Tank.js
│   │
│   ├── routes
│   │   └── tankRoutes.js
│   │
│   ├── middleware
│   │   └── errorMiddleware.js
│   │
│   ├── utils
│   │   └── tankCalculator.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── public
│   │   └── favicon.ico
│   │
│   ├── src
│   │   ├── api
│   │   │   └── tankApi.js
│   │   │
│   │   ├── components
│   │   │   ├── TankCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StatusIndicator.jsx
│   │   │
│   │   ├── pages
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   │
│   │   ├── context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── styles
│   │   │   └── global.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── screenshots
│   ├── dashboard.png
│   └── login.png
│
├── docs
│   ├── architecture.png
│   └── circuit-diagram.png
│
├── README.md
├── .gitignore
└── LICENSE
```
---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/water-level-monitor.git
cd water-level-monitor


---

🔧 Backend Setup

Navigate to backend folder

cd backend

Install dependencies

npm install

Create .env file

PORT=5000
MONGO_URI=your_mongodb_connection_string

Start backend server

npm run dev

Server will run at

http://localhost:5000


---

💻 Frontend Setup

Navigate to frontend

cd frontend

Install dependencies

npm install

Run development server

npm run dev

Frontend runs at

http://localhost:5173


---

📡 ESP32 Setup

Upload the ESP32 code using Arduino IDE.

Update the following values:

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

String apiUrl = "http://YOUR_SERVER_IP:5000/api/tank/update";
String tankId = "tank_01";

ESP32 will periodically send water level data to the backend.


---

🔌 Hardware Circuit

```
Ultrasonic Sensor → ESP32

VCC  → 5V
GND  → GND
TRIG → GPIO 5
ECHO → GPIO 18
```
---

🔗 API Documentation

Update Tank Level

Endpoint

POST /api/tank/update

Example Request

{
  "tankId": "tank_01",
  "level": 78,
  "distance": 22
}

Example Response

{
  "status": "success",
  "message": "Tank level updated"
}


---

📊 Future Improvements

Mobile application

SMS / WhatsApp alerts

Historical water usage analytics

Multiple tank monitoring

MQTT real-time data streaming



---

👨‍💻 Author

A. Yuvaraj

IoT Developer

Full Stack Developer

Ethical Hacking Enthusiast



---

📜 License

This project is licensed under the MIT License.

---
