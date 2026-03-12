# ⚙️ Backend — Smart Water Level Monitoring System

The **Express.js API server** is the central hub of the system. It receives sensor data from ESP32 boards via **MQTT**, stores logs in **MongoDB Atlas**, handles user authentication with **JWT**, and serves the React dashboard through a REST API.

---

## 🚀 Tech Stack

| Technology | Version | Role |
|---|---|---|
| **Node.js** | v16+ | Runtime |
| **Express** | v5.2.x | REST API framework |
| **MongoDB / Mongoose** | v9.2.x | NoSQL database |
| **JWT / Bcrypt.js** | — | Auth & password hashing |
| **MQTT.js** | — | IoT message broker bridge |

---

## 📂 Project Structure

```
backend/
├── config/
│   ├── db.js            # MongoDB Atlas connection
│   └── mqtt.js          # MQTT broker subscriber setup
├── controllers/
│   ├── authController.js
│   ├── tankController.js
│   └── analyticsController.js
├── middleware/
│   └── authMiddleware.js  # JWT protect() & apiAuth()
├── models/
│   ├── User.js            # User schema
│   ├── Tank.js            # Tank schema (level, motor, thresholds)
│   └── Log.js             # Historical reading schema
├── routes/
│   ├── authRoutes.js
│   ├── tankRoutes.js
│   └── analyticsRoutes.js
└── server.js
```

---

## 🗄 Database Models

### `User.js`
| Field | Type | Description |
|---|---|---|
| `name` | String | Display name |
| `email` | String | Unique login identifier |
| `password` | String | Bcrypt hashed |
| `role` | String | `user` or `admin` |

### `Tank.js`
| Field | Type | Description |
|---|---|---|
| `tankHeight` | Number | Physical tank height in cm |
| `tankCapacityLiters` | Number | Total capacity in litres |
| `currentLevel` | Number | Current water level (%) |
| `waterVolume` | Number | Calculated volume in litres |
| `motorStatus` | String | `ON` or `OFF` |
| `user` | ObjectId | Owner reference |

### `Log.js`
| Field | Type | Description |
|---|---|---|
| `tank` | ObjectId | Tank reference |
| `level` | Number | Water level % at time of reading |
| `distance` | Number | Raw sensor distance (cm) |
| `timestamp` | Date | Reading timestamp |

---

## 📡 MQTT Integration

The backend subscribes to:
```
watermonitor/tank/{tankId}/level
```

**Incoming payload from ESP32 Sensor:**
```json
{
  "apiKey": "esp32-secret-key-999",
  "distance": 42.5,
  "waterLevel": 57.5,
  "tankHeight": 100.0
}
```

The server:
1. Validates the `apiKey`
2. Updates the tank's `currentLevel`, `waterVolume` in MongoDB
3. Creates a new `Log` entry
4. If `waterLevel < 20%`, automatically publishes `ON` to `watermonitor/tank/{tankId}/motor`
5. If `waterLevel > 90%`, automatically publishes `OFF` to `watermonitor/tank/{tankId}/motor`

---

## 🔌 REST API Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Create new user account |
| POST | `/login` | None | Login, returns JWT token |
| PUT | `/profile` | JWT | Update profile |

### Tank — `/api/tank`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Get all tanks for user |
| PUT | `/` | JWT | Update tank settings |
| POST | `/motor` | JWT | Manual motor ON/OFF command |
| POST | `/update` | API Key | ESP32 HTTP sensor data push (alternative to MQTT) |

**`POST /api/tank/update` payload:**
```json
{
  "apiKey": "esp32-secret-key-999",
  "distance": 42.5,
  "waterLevel": 57.5,
  "tankHeight": 100.0
}
```

### Analytics — `/api/analytics`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/daily` | JWT | Last 24h readings aggregated |
| GET | `/weekly` | JWT | Last 7 days aggregated |
| GET | `/monthly` | JWT | Last 30 days aggregated |

---

## ⚙️ Environment Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` file
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/water-monitor
JWT_SECRET=your_minimum_256_bit_secret_key
MQTT_BROKER_URL=mqtt://broker.hivemq.com
```

### 3. Start the server
```bash
npm run dev       # Development (nodemon, hot reload)
npm start         # Production
```

Server runs at `http://localhost:5000` by default.

---

## 🔐 Security Notes

- All dashboard routes require `Authorization: Bearer <JWT_TOKEN>` header
- ESP32 firmware endpoints use a separate `apiKey` guard (`authMiddleware.apiAuth`)
- Passwords are salted and hashed using `bcrypt` before storage — never stored in plain text
- JWT tokens expire after 30 days by default (configurable in `authController.js`)
