# ⚡ Smart Water Level Monitoring System - Backend

This is the Node.js / Express backend for the **Smart Water Level Monitoring System**. It provides a RESTful API for handling data from the ESP32 IoT device and serving it to the React frontend dashboard.

## 🚀 Built With
- **Node.js & Express.js**: Fast, scalable network applications server framework.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling and object modeling for Node.js.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing.
- **Dotenv**: Loads environment variables from `.env` files.

## ✨ Features
- **Data Insertion API**: Securely accepts POST requests from the ESP32 payload to log water levels in real time.
- **Data Retrieval API**: Delivers tank statistics to the React dashboard.
- **Database Schema Modeling**: Fully functional models using Mongoose for tank identification and historic values.

## ⚙️ Usage

### Prerequisites
- Node.js (v16 or higher)
- NPM or Yarn
- Valid **MongoDB Atlas** connection string

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5000`.

## 📂 File Structure

- `server.js`: Application entry point and main configuration.
- `routes/`: Express application routing.
- `controllers/`: Core application logic triggered by routes.
- `models/`: Mongoose schemas.
- `config/`: Configuration setup (e.g., DB connection).

## 📡 API Endpoints

### `POST /api/tank/update`
Receives new sensor data from the ESP32.
**Body:**
```json
{
  "tankId": "tank_01",
  "level": 78,
  "distance": 22
}
```

### `GET /api/tank/data`
**(Example Route)** - Used by frontend to retrieve the latest data.
