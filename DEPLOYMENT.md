# Full Stack Smart Water Level Monitoring System

## Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Sandbox is free).
3. Under "Database Access", create a new database user and save the password.
4. Under "Network Access", allow access from anywhere (`0.0.0.0/0`) or specific IP.
5. Get your connection string: Go to Clusters > Connect > Connect your application. It will look like: 
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/water-level-monitor?retryWrites=true&w=majority`

### 2. Backend Deployment (Render)
1. Push your `backend` directory to a GitHub repository or subfolder.
2. Sign up on [Render.com](https://render.com/).
3. Click **New > Web Service**.
4. Connect your GitHub repo.
5. Settings:
   - Root Directory: `backend` (if in monorepo)
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. **Environment Variables**:
   Set up the following variables in Render's dashboard based on your `backend/.env` file:
   - `NODE_ENV=production`
   - `MONGO_URI=<Your MongoDB Atlas connection string>`
   - `JWT_SECRET=<A strong random string>`
   - `ESP32_API_KEY=<A strong random string for your IoT device>`
7. Click **Create Web Service**. Wait for it to build and get your backend URL.

### 3. Frontend Deployment (Vercel)
1. Push your `frontend` directory to GitHub.
2. Sign up on [Vercel](https://vercel.com/).
3. Click "Add New Project" and import your repository.
4. Set the Root Directory to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL=<Your Render Backend URL>/api`
6. Click **Deploy**.

### 4. ESP32 Setup
1. Open `iot/esp32_example.ino` in the Arduino IDE.
2. Install the necessary libraries: `ArduinoJson` and standard ESP32 boards.
3. Update the variables:
   - `ssid` and `password`
   - `apiUrl` (Your Render Backend URL + `/api/tank/update`)
   - `apiKey` (Matches the one deployed on Render)
   - `tankId` (Create a user in the web UI, grab the Tank ID from your database)
4. Flash the code to your ESP32 connected to an Ultrasonic sensor.

Your Smart Water Level Monitoring System is now fully deployed and operational!
