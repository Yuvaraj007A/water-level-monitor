# ⚙️ Smart Water Level Monitoring System - Backend Module

The **backend API** server powers the real-time functionality of the **Smart Water Level Monitoring System**. Written in Node.js and Express.js, it securely processes HTTP endpoints invoked by IoT sensors, coordinates JWT authentication, calculates usage analytics, and manages data inside **MongoDB Atlas**. It also interfaces with an **MQTT broker** to asynchronously toggle motor hardware.

---

## 🚀 Key Technologies
- **Node.js (v16+)** & **Express (v5.2.x)** - Event-driven RESTful API handler.
- **MongoDB / Mongoose (v9.2.x)** - NoSQL data structures.
- **JSON Web Tokens (JWT) / Bcrypt** - Secure user registration, authentication, and password hashing workflows.
- **MQTT.js** - Enables two-way queued communication to manually or automatically toggle an attached motor (`ON`/`OFF`).

---

## 📂 Models & Architecture

### DB Schemas (`models/`)
1. **User.js**: Mongoose model encompassing `name`, `email`, encrypted `password`, and a user `role`.
2. **Tank.js**: Represents the physical limits of an entity (`tankHeight`, `tankCapacityLiters`) and monitors current states like `currentLevel` (percentage), `waterVolume` (calculated capacity), and `motorStatus`. Belongs to a specific User.
3. **Log.js**: Records historical snapshots storing `level` and a `timestamp` string. This schema forms the data foundation for user-facing analytics and charts.

### API Routing (`routes/`)
- **/api/auth**: Account management: POST `/register`, POST `/login`, PUT `/profile`. Protected via `protect()` JWT middleware validation.
- **/api/tank**: Tank data ingestion gateway: GET `/`, PUT `/`, POST `/motor`. Exposes POST `/update` bound to `apiAuth` exclusively designed to listen for and decode **ESP32 Firmware** payloads.
- **/api/analytics**: Usage query endpoints returning aggregated views: GET `/daily`, `/weekly`, and `/monthly`.

---

## ⚙️ Usage & Environment Setup

### Installation Steps

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish your environment. Create a `.env` file at the directory root containing:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<auth>.mongodb.net/water-monitor
   JWT_SECRET=YOUR_SECRET_256_BIT_KEY
   MQTT_BROKER_URL=mqtt://broker.emqx.io
   ```
4. Start the server (Dev Mode utilizing Nodemon):
   ```bash
   npm run dev
   ```

*The application will by default run on `http://localhost:5000`*. 

---

## 📡 Essential IoT API Interactions

The IoT node sends an HTTP POST request to update the real-time tank state. Ensure requests pass necessary authorization defined in the security layer:

**POST `/api/tank/update`**
```json
{
  "tankId": "YOUR_MONGO_OBJECT_ID",
  "level": 74,
  "distance": 26,
  "volume": 740
}
```
**JSON Response:**
```json
{
  "success": true,
  "message": "Tank updated",
  "data": { "currentLevel": 74, "motorStatus": "OFF" }
}
```

If the automated threshold dips below a critical minimum (e.g. `20%`), the server will simultaneously fire an MQTT publish event on topic `tank/motor/control` carrying a `{"command": "ON"}` payload, instructing the IoT relay node to start the pump.
