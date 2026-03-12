# 📡 IoT Firmware — ESP32 Sensor & Relay

This directory contains the Arduino C++ firmware for the two ESP32 boards that form the hardware layer of the Smart Water Level Monitoring System. Both boards run **three communication protocols simultaneously**:

| Protocol | Purpose | Works offline? |
|---|---|---|
| **Wi-Fi** | Connects to home router | Required for MQTT |
| **MQTT** | Cloud reports + remote control from dashboard | ❌ Needs internet |
| **ESP-NOW** | Direct board-to-board local signal | ✅ Yes — no internet needed |

---

## 🗂 Firmware Files

```
iot/
├── esp32_sensor/
│   └── esp32_sensor.ino   ← Flash onto the Sensor ESP32
├── esp32_relay/
│   └── esp32_relay.ino    ← Flash onto the Relay ESP32
├── esp32_example.ino      ← Legacy all-in-one (single board, no ESP-NOW)
└── simulator.js           ← Software mock (no hardware needed)
```

---

## ⚡ How the Two Boards Communicate

```
┌──────────────────────┐          ┌──────────────────────┐
│   ESP32 SENSOR       │          │   ESP32 RELAY        │
│  (top of tank)       │          │  (near motor/pump)   │
│                      │          │                      │
│  HC-SR04 Ultrasonic  │          │  Relay Module GPIO 4 │
│  Trig → GPIO 5       │          │  Controls water pump │
│  Echo → GPIO 18      │          │                      │
│                      │ ESP-NOW  │                      │
│  Sends every 5s ─────┼─────────►│ Auto-controls motor  │
│                      │  (local) │ even without internet│
│                      │          │                      │
│       MQTT ──────────┼──────────┼────────── MQTT       │
│   Publishes level    │ (cloud)  │  Subscribes to cmds  │
└──────────────────────┘          └──────────────────────┘
```

### Priority of control on the Relay:
1. **MQTT cloud command** (manual override from dashboard — highest priority)
2. **ESP-NOW local signal** (automatic fill/stop based on thresholds)

---

## 🪣 Node 1 — `esp32_sensor.ino`

**Role:** Reads the ultrasonic sensor and broadcasts the water level via two channels.

### What it does every 5 seconds:
1. Fires the HC-SR04 ultrasonic pulse and reads the distance in cm
2. Calculates **water level %** using the configured tank height:
   ```
   waterLevel% = ((tankHeight - distance) / tankHeight) × 100
   ```
3. **Publishes via MQTT** to `watermonitor/tank/{tankId}/level`:
   ```json
   {
     "apiKey": "esp32-secret-key-999",
     "distance": 42.5,
     "waterLevel": 57.5,
     "tankHeight": 100.0
   }
   ```
4. **Sends via ESP-NOW** directly to the Relay (works even without internet)

### Pin Reference

| Pin | GPIO | Description |
|---|---|---|
| Trig | 5 | Ultrasonic trigger output |
| Echo | 18 | Ultrasonic echo input |
| BOOT | 0 | Hold on power-up to enter config mode |

---

## ⚡ Node 2 — `esp32_relay.ino`

**Role:** Controls the water pump motor. Listens on both MQTT (cloud) and ESP-NOW (local).

### Automation logic (ESP-NOW, works offline):

| Condition | Action |
|---|---|
| `distance ≤ tankFullCm` | Motor **OFF** — tank is full |
| `distance ≥ tankEmptyCm` | Motor **ON** — tank is empty |
| Between thresholds | No change — maintain current state |

### Manual override (MQTT, from dashboard):
- Receives `ON` or `OFF` on topic `watermonitor/tank/{tankId}/motor`
- Overrides ESP-NOW automation immediately

### Pin Reference

| Pin | GPIO | Description |
|---|---|---|
| Relay | 4 | Motor relay output (HIGH = pump ON) |
| BOOT | 0 | Hold on power-up to enter config mode |

---

## ⚙️ One-Time Setup (No Hardcoding Required)

Both boards use a **built-in web Admin Dashboard** — you configure everything through a browser, saved persistently in NVS flash.

### Step 1 — Flash the Relay Board
1. Open `esp32_relay/esp32_relay.ino` in Arduino IDE
2. Install the ESP32 board package if needed:
   `Preferences → Additional Boards Manager URLs →` add:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
3. Upload the sketch to the Relay ESP32

### Step 2 — Get the Relay's MAC Address
1. On boot, the Relay creates a Wi-Fi network: **`Relay-Setup`**
2. Connect your phone/PC to `Relay-Setup`
3. Open `http://192.168.4.1` in your browser
4. Scroll to the bottom — you'll see the **Relay MAC address** (e.g. `A4:CF:12:AB:CD:EF`)
5. **Copy this MAC address**
6. Fill in your Wi-Fi, MQTT Broker, and Tank ID, then configure tank thresholds:

| Field | Example | Description |
|---|---|---|
| WiFi SSID | `MyHomeWiFi` | Your router name |
| WiFi Password | `mypassword` | Your router password |
| MQTT Broker | `broker.hivemq.com` | Default public broker |
| Tank ID | `64f3...abc` | MongoDB `_id` of the tank |
| Tank Empty (cm) | `85` | Distance at which motor turns ON |
| Tank Full (cm) | `8` | Distance at which motor turns OFF |

7. Click **Save & Restart**

### Step 3 — Flash the Sensor Board
1. Open `esp32_sensor/esp32_sensor.ino` and upload
2. The Sensor creates a Wi-Fi network: **`Sensor-Setup`**
3. Connect and open `http://192.168.4.1`
4. Fill in all fields including:

| Field | Example | Description |
|---|---|---|
| Relay MAC Address | `A4:CF:12:AB:CD:EF` | Copied from Step 2 |
| Tank Height (cm) | `100` | Full height of your tank |

5. Click **Save & Restart**

### Step 4 — Verify Operation
Open the Arduino IDE Serial Monitor (115200 baud) on either board. You should see:
```
========== SENSOR BOOT ==========
[WiFi] Connected ✓
[ESP-NOW] Ready! WiFi Channel: 6
[SENSOR] Distance: 54.20 cm | Water Level: 45.8%
[MQTT] Published ✓
[ESP-NOW] Send Status: Delivered ✓
```

---

## 🖥 Software Simulator (No Hardware Required)

The `simulator.js` script sends randomized water level readings to the backend API — useful for testing the full stack without physical hardware.

```bash
cd iot
npm install           # Install dependencies
node simulator.js     # Start sending mock readings
```

> Make sure the backend is running on `http://localhost:5000` first.

---

## 🔧 ESP-NOW Channel Notes

ESP-NOW and Wi-Fi **share the same antenna** on the ESP32. Both must operate on the **same Wi-Fi channel**.

The firmware handles this automatically:
1. Connects to Wi-Fi first (router assigns channel, e.g. channel 6)
2. Initialises ESP-NOW **after** Wi-Fi connects
3. ESP-NOW automatically uses the same channel

> ⚠️ If you change your router's Wi-Fi channel, just restart both boards and they will re-sync automatically.

---

## 📦 Required Arduino Libraries

Install these via **Arduino IDE → Library Manager**:

| Library | Install As |
|---|---|
| `PubSubClient` | Nick O'Leary |
| `ArduinoJson` | Benoit Blanchon |
| `ESP32 Board Package` | Espressif Systems (via Boards Manager) |

`esp_now.h` and `WiFi.h` are built into the ESP32 Arduino core — no separate install needed.
