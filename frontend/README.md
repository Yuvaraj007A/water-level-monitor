# 💧 Frontend — Smart Water Level Monitoring System

The **React web dashboard** is the user-facing control center for the Smart Water Level Monitoring System. It displays real-time water levels, lets users manually control the pump motor, and presents historical usage analytics through interactive charts.

---

## 🚀 Tech Stack

| Technology | Version | Role |
|---|---|---|
| **React (Vite)** | 19 / 7.x | UI framework & build tool |
| **Tailwind CSS** | v3 | Utility-first styling |
| **Framer Motion** | v12 | Animations & transitions |
| **Recharts** | v3 | SVG-based data charts |
| **Axios** | v1.x | HTTP API client with interceptors |

---

## 📂 Project Structure

```
frontend/
└── src/
    ├── components/
    │   ├── TankVisualizer.jsx    # Animated 3D-style tank fill component
    │   ├── Navbar.jsx            # Top navigation bar
    │   ├── WaterBackground.jsx   # Animated landing page background
    │   └── ProtectedRoute.jsx    # JWT auth guard for private routes
    ├── pages/
    │   ├── Landing.jsx           # Home / entry page
    │   ├── Login.jsx             # User login
    │   ├── Register.jsx          # User registration
    │   ├── Dashboard.jsx         # Live tank monitoring & motor control
    │   └── Analytics.jsx         # Historical usage charts
    ├── context/
    │   └── AuthContext.jsx       # Global JWT auth state
    └── main.jsx                  # App entry, React Router setup
```

---

## ✨ Pages & Features

### 🏠 Landing (`Landing.jsx`)
Animated entry page with `WaterBackground.jsx` water ripple effect. Entry points to Login and Register.

### 🔐 Login & Register
JWT-based authentication. On login, the token is stored in context and local storage. `ProtectedRoute` automatically redirects unauthenticated users to `/login`.

### 📊 Dashboard (`Dashboard.jsx`)
The main monitoring view:
- **Animated Tank Visualizer** — real-time fill percentage with smooth level transitions
- **Live Status Cards** — current water level %, distance (cm), and motor status
- **Manual Motor Control** — ON/OFF toggle button sends command to backend which relays via MQTT
- **Auto-refresh** — polls the backend API every few seconds for live updates

### 📈 Analytics (`Analytics.jsx`)
Historical charts with three time ranges:
- **Daily** — hourly readings from the last 24 hours
- **Weekly** — daily averages from the last 7 days
- **Monthly** — weekly averages from the last 30 days

Charts are rendered using Recharts with composed line/area layouts.

---

## ⚙️ Development Setup

### Prerequisites
- Node.js v18 or higher
- Backend running on `http://localhost:5000`

### Install & Run
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` root:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# → http://localhost:5173
```

### Production Build
```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, or any static host
```

---

## 🌐 Deployment (Vercel)

The frontend is deployed automatically via **Vercel** linked to the GitHub repository.

Set the following environment variable in Vercel's dashboard:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

Every push to `main` triggers an automatic redeploy.

---

## 🔌 API Integration

All requests include the JWT token via Axios interceptors:
```js
Authorization: Bearer <token>
```

Key endpoints used:
| Endpoint | Used In |
|---|---|
| `POST /api/auth/login` | Login.jsx |
| `POST /api/auth/register` | Register.jsx |
| `GET /api/tank` | Dashboard.jsx |
| `POST /api/tank/motor` | Dashboard.jsx (motor toggle) |
| `GET /api/analytics/daily` | Analytics.jsx |
| `GET /api/analytics/weekly` | Analytics.jsx |
| `GET /api/analytics/monthly` | Analytics.jsx |
