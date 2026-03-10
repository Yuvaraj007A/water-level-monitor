# 💧 Smart Water Level Monitoring System - Frontend

This is the React frontend for the **Smart Water Level Monitoring System**. It provides a real-time dashboard to monitor water levels sent by the ESP32 IoT device.

## 🚀 Built With
- **React (Vite)**: Fast and modern frontend library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: Promised-based HTTP client for API requests
- **Lucide React**: Beautiful iconography

## ✨ Features
- **Real-Time Dashboard**: See live water levels from monitored tanks.
- **Responsive Layout**: Designed to work smoothly on both desktop and mobile devices.
- **REST API Integration**: Connects with the Node/Express backend to fetch current level data.

## ⚙️ Usage

### Prerequisites
- Node.js (v16 or higher)
- NPM or Yarn
- The backend API must be running (see the `backend` folder setup instructions).

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend` folder (if needed):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The application will typically be accessible at `http://localhost:5173`.

## 📁 File Structure

- `src/components`: UI components like Navbar and Tank cards.
- `src/pages`: Top-level views (e.g., Dashboard, Login).
- `src/api`: Configuration and setup for Axios calls.
- `src/styles`: Global CSS (Tailwind configurations).
