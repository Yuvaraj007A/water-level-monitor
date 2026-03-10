# 📡 Smart Water Level Monitoring System - IoT Firmware

This module contains the hardware firmware (`esp32_example.ino`) and a testing script (`simulator.js`) for the **Smart Water Level Monitoring System**. 

The main purpose of the firmware is to calculate the water level based on the distance obtained from the HC-SR04 ultrasonic sensor and transmit it via WiFi to the system's Node.js Express backend API.

## 🚀 Contents

### `esp32_example.ino`
The main ESP32 code built on the Arduino IDE framework that handles:
- Establishing a stable WiFi connection.
- Reading echo delays from the ultrasonic sensor and decoding them into raw distance/level percentages.
- Sending robust HTTP POST requests to the dashboard's API endpoints at a regular interval.

#### Prerequisite Software and Libraries
- Add the [ESP32 board package](https://dl.espressif.com/dl/package_esp32_index.json) to your Arduino IDE.
- Default `WiFi.h` and `HTTPClient.h` libraries are required (built-in).

#### Deployment Configuration
Before flashing the module, make sure to replace placeholder strings inside the C++ code with your specific environment properties:
```cpp
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Adjust hostname depending on your live/local backend deployment.
String apiUrl = "http://YOUR_SERVER_IP:5000/api/tank/update";
String tankId = "tank_01";
```

#### Pin Outline
| Ultrasonic Sensor | ESP32 GPIO | Description|
|-------------------|------------|------------|
| VCC               | 5V (VIN)   | Power line |
| GND               | GND        | Ground     |
| TRIG              | 5          | Trigger    |
| ECHO              | 18         | Echo       |

---

### `simulator.js`
A basic Javascript application running on Node.js designed to simulate ESP32 HTTP requests locally.

**Usage:**
This relies on sending fake HTTP POST requests without the need of the ultrasonic sensor module or an active ESP32 board, meaning you can test the software entirely in isolation. Run the script using Node:
```bash
node simulator.js
```
*Ensure that the `backend` server application is currently active before running.*
