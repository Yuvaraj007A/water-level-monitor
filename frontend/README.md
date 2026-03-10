# 💧 Smart Water Level Monitoring System - Frontend Module

The **frontend UI dashboard** serves as the central hub of interaction for the **Smart Water Level Monitoring System**. Built with **React 19 (Vite)**, it provides users with secure authentication, highly visual real-time tank analysis, historical data graphing, and an interactive mechanism to directly influence the automated water pumping motor logic.

---

## 🚀 Key Technologies
- **React (Vite 7.x)** - Unmatched hot-module replacement and build architecture.
- **Tailwind CSS (v3)** - Responsive, modular utility-class styling. 
- **Framer Motion (v12)** - Robust page transitions and dynamic visual states natively baked into UI components like `TankVisualizer.jsx`.
- **Recharts (v3)** - Real-time composed SVG chart layouts (`Analytics.jsx`) processing historical Node/MongoDB log payloads.
- **Axios (v1.x)** - Promise-based RESTful API client interceptors.

---

## ✨ Features & Architecture

### Core Pages (`src/pages/`)
1. **Landing.jsx**: Eye-catching entry point equipped with an animated `WaterBackground.jsx` element.
2. **Login.jsx / Register.jsx**: Secure JWT form entryways tightly coupled with the `AuthContext` component.
3. **Dashboard.jsx**: Central command post utilizing a real-time HTTP polling strategy that synchronizes state, updates 3D-styled SVGs indicating current liters and percentage, and presents immediate manual toggle controls.
4. **Analytics.jsx**: A distinct visual layout tab representing "Daily," "Weekly," and "Monthly" aggregation endpoints mapped identically from the `backend/routes/analyticsRoutes.js`.

### Protective Middleware (`src/components/`)
- `ProtectedRoute.jsx`: Automatically forces unauthenticated users attempting to bypass the dashboard URL back to `/login` ensuring rigid gateway policies. 

---

## ⚙️ Development Setup

### System Prerequisites
- Node.js (v18 or higher)
- NPM or yarn
- Verify that your `/backend/` cluster is actively listening on a valid HTTP port.

### Execution Guide

1. Pivot your terminal path to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the application bundles from `package.json`:
   ```bash
   npm install
   ```
3. Initialize environment properties. Generate `.env` in the root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Fire up the development engine:
   ```bash
   npm run dev
   ```

You will normally preview the UI directly on `http://localhost:5173`. 
