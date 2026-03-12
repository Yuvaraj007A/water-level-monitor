# 📡 Smart Water Level Monitoring System - Hardware (IoT) Firmware

The `iot` directory bridges the physical **esp32 hardware** to the cloud system. This folder contains the raw C++ Arduino codebase driving the ultrasonic sensors (`esp32_example.ino`) alongside a Node.js utility script (`simulator.js`) for rapid mocked development bypassing physical dependency.

---

## 🚀 Firmware Options 

You can deploy the system using a single unified ESP32, or distribute the hardware across two separate ESP32 chips for physical convenience!

### Option 1: All-in-One (`esp32_example.ino`)
The legacy, complete codebase. This script manages both the ultrasonic sensor HTTP/MQTT publishing AND the motor's relay subscription simultaneously on the same board.
* **Ultrasonic Trig/Echo:** GPIO 5, 18
* **Motor Relay Output:** GPIO 4

---

### Option 2: Distributed Architecture (Recommended)

Because the system uses an MQTT broker as the middle-man, you can place the Sensor on top of the water tank, and the Motor Relay inside your house miles away, as long as both connect to Wi-Fi!

#### A. Node 1 - Sensor Device (`esp32_sensor/esp32_sensor.ino`)
Contains *only* the logic to fire an ultrasonic pulse and publish the read coordinates to the cloud.
* **Ultrasonic Trig/Echo:** GPIO 5, 18

#### B. Node 2 - Relay Device (`esp32_relay/esp32_relay.ino`)
Contains *only* the logic to maintain a lightweight MQTT connection subscribing to `ON`/`OFF` hardware commands.
* **Motor Relay Output:** GPIO 4

*The motor is generally tied to GPIO 2 or driven by independent MQTT relay nodes out-of-scope for the primary ultrasonic measurement.*

---

### 2. `simulator.js` (Software Simulator)
The `simulator.js` node application actively sends randomly fluctuating (but bounded) virtual water level numbers directly to the active `backend` API via synchronous intervals locally without utilizing the actual ESP32 chip.

**Why use it?**
- To test the load behavior of your Node.js routing controller and MongoDB `Log` logging schemas.
- To observe how Recharts natively render "Live Data" changes within the `Dashboard.jsx`.
- To bypass messy hardware assembly dependencies for casual frontend experimentation.

---

## ⚙️ Initial Configuration

### Hardware Installation Steps
1. Insert your **esp32 board** definitions into Arduino IDE via `Preferences > Additional Boards Manager URLs` [Link to package](https://dl.espressif.com/dl/package_esp32_index.json).
2. Establish your static parameters located directly at the top of the C++ file:
   ```cpp
   const char* ssid = "YOUR_WIFI_NETWORK_NAME";
   const char* password = "YOUR_WIFI_KEY";

   // Direct your API Url exactly. e.g. http://192.168.1.15:5000/api/tank/update
   String apiUrl = "http://YOUR_SERVER_LOCAL_NETWORK_IP/api/tank/update";
   
   // Create a tank on the frontend UI and copy its unique MongoDB _id here:
   String tankId = "60a1..ObjectId..b323";
   ```
3. Attach to a USB-to-Serial port and upload the compiled sketch.

### Simulator Setup Steps
If preferring to utilize the mocked generator, you simply run the script directly through the standard terminal.

1. CD into the `iot` directory:
   ```bash
   cd iot
   ```
2. Manually modify `simulator.js` to contain the unique active MongoDB `tankId`.
3. Boot the instance:
   ```bash
   node simulator.js
   ```
*(Ensure the backend API on port 5000 is concurrently functioning.)*
