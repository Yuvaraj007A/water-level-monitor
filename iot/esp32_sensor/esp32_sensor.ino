// ============================================================
// ESP32 SENSOR - Water Level Monitor
// Protocols: WiFi + MQTT (Cloud) + ESP-NOW (Local/Direct)
// ============================================================
#include <ArduinoJson.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp_now.h>

// Initialize WebServer on port 80 and Non-Volatile Storage (Preferences)
WebServer server(80);
Preferences preferences;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Configuration Variables
String ssid       = "";
String password   = "";
String mqttServer = "";
String tankId     = "";
const char *apiKey = "esp32-secret-key-999";

// ─── Tank Adjustment Variables (saved in NVS) ───────────────
// tankHeightCm: Physical distance from sensor to tank bottom (tank full height)
// Used to calculate water level percentage:
//   waterLevel% = ((tankHeightCm - distance) / tankHeightCm) * 100
float tankHeightCm = 100.0; // Default: 100 cm tall tank

// Hardware Pins (SENSOR ONLY)
const int trigPin   = 5;
const int echoPin   = 18;
const int configPin = 0; // The built-in "BOOT" button on most ESP32 boards

// Sound speed for ultrasonic
#define SOUND_SPEED 0.034

long  duration;
float distanceCm;
float waterLevelPct; // Calculated water level percentage

// System States
bool configMode  = false;
bool espNowReady = false;
unsigned long lastReadingTime = 0;

// MQTT Topics automatically generated from tankId
String publishTopic = "";

// ==========================================
// ESP-NOW: Shared data structure
// MUST match the exact same struct in esp32_relay.ino
// ==========================================
typedef struct espnow_message {
  float distance;
  float waterLevelPct;
  char  tankId[64];
  char  apiKey[64];
} espnow_message;

// ⚠️  Paste the MAC address of your RELAY ESP32 here.
// Go to the Relay's setup page to find its MAC address.
// It will also be auto-loaded from NVS if saved via dashboard.
uint8_t relayMacAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// ESP-NOW send callback
void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("[ESP-NOW] Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivered ✓" : "Failed ✗");
}

// ==========================================
// INITIALIZE ESP-NOW
// Called AFTER WiFi is connected so channel is locked in
// ==========================================
void initESPNow() {
  if (esp_now_init() != ESP_OK) {
    Serial.println("[ESP-NOW] Initialization FAILED");
    return;
  }

  esp_now_register_send_cb(onDataSent);

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, relayMacAddress, 6);
  peerInfo.channel = WiFi.channel();
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("[ESP-NOW] Failed to add Relay peer");
    return;
  }

  espNowReady = true;
  Serial.print("[ESP-NOW] Ready! WiFi Channel: ");
  Serial.println(WiFi.channel());
  Serial.print("[ESP-NOW] Targeting Relay MAC: ");
  for (int i = 0; i < 6; i++) {
    if (i > 0) Serial.print(":");
    Serial.printf("%02X", relayMacAddress[i]);
  }
  Serial.println();
}

// ==========================================
// SEND READING VIA ESP-NOW (local direct)
// ==========================================
void sendViaESPNow(float dist, float lvlPct) {
  if (!espNowReady) return;

  espnow_message msg;
  msg.distance     = dist;
  msg.waterLevelPct = lvlPct;
  tankId.toCharArray(msg.tankId, sizeof(msg.tankId));
  strncpy(msg.apiKey, apiKey, sizeof(msg.apiKey));

  esp_err_t result = esp_now_send(relayMacAddress, (uint8_t *)&msg, sizeof(msg));
  if (result != ESP_OK) {
    Serial.println("[ESP-NOW] Send error: " + String(result));
  }
}

// ==========================================
// PARSE STORED MAC ADDRESS
// Stored as "AA:BB:CC:DD:EE:FF" → uint8_t array
// ==========================================
void parseMacAddress(String macStr, uint8_t *mac) {
  int idx = 0;
  for (int i = 0; i < 6; i++) {
    mac[i] = (uint8_t)strtol(macStr.substring(idx, idx + 2).c_str(), NULL, 16);
    idx += 3;
  }
}

// ==========================================
// ADMIN DASHBOARD HTML
// ==========================================
void handleRoot() {
  String tankHeightStr = String(tankHeightCm, 1);

  String html = "<!DOCTYPE html><html><head><meta name=\"viewport\" "
                "content=\"width=device-width, initial-scale=1\">";
  html += "<title>Sensor Admin Dashboard</title>";
  html += "<style>";
  html += "body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#f8fafc;margin:0;padding:20px;text-align:center;}";
  html += ".container{max-width:440px;margin:0 auto;background:#1e293b;padding:30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.3);}";
  html += "h2{color:#3b82f6;margin-top:0;}";
  html += ".badge{display:inline-block;background:#1d4ed8;color:#bfdbfe;font-size:11px;border-radius:6px;padding:2px 8px;margin-bottom:20px;}";
  html += ".section{background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;text-align:left;}";
  html += ".section-title{color:#38bdf8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}";
  html += "label{display:block;text-align:left;margin-bottom:5px;color:#94a3b8;font-size:13px;}";
  html += "input{width:100%;padding:10px;margin-bottom:14px;box-sizing:border-box;border:1px solid #334155;background:#1e293b;color:white;border-radius:6px;font-size:14px;}";
  html += ".hint{font-size:11px;color:#475569;margin-top:-10px;margin-bottom:14px;text-align:left;}";
  html += "button{width:100%;padding:12px;background:#3b82f6;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer;transition:.3s;font-size:15px;}";
  html += "button:hover{background:#2563eb;}";
  html += ".info-box{background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:12px;margin-top:20px;font-size:12px;color:#64748b;text-align:left;}";
  html += ".info-box span{color:#38bdf8;font-weight:bold;font-size:13px;}";
  html += "</style></head><body>";
  html += "<div class=\"container\">";
  html += "<h2>📡 Sensor Setup</h2>";
  html += "<div class=\"badge\">WiFi + MQTT + ESP-NOW</div>";
  html += "<form action=\"/save\" method=\"POST\">";

  // ── Network Settings ──
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🌐 Network Settings</div>";
  html += "<label>WiFi SSID</label><input type=\"text\" name=\"ssid\" placeholder=\"Your Home Wi-Fi\" value=\"" + ssid + "\">";
  html += "<label>WiFi Password</label><input type=\"password\" name=\"password\" placeholder=\"***\" value=\"" + password + "\">";
  html += "<label>MQTT Broker</label><input type=\"text\" name=\"mqttServer\" placeholder=\"broker.hivemq.com\" value=\"" + mqttServer + "\">";
  html += "<label>Tank ID (MongoDB)</label><input type=\"text\" name=\"tankId\" placeholder=\"Paste Tank ID here...\" value=\"" + tankId + "\">";
  html += "</div>";

  // ── ESP-NOW Settings ──
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">📶 ESP-NOW Pairing</div>";
  html += "<label>Relay MAC Address</label>";
  html += "<input type=\"text\" name=\"relayMac\" placeholder=\"AA:BB:CC:DD:EE:FF (from Relay page)\">";
  html += "<div class=\"hint\">Find this on the Relay's setup page. Leave blank to keep existing.</div>";
  html += "</div>";

  // ── Tank Adjustment ──
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🪣 Tank Calibration</div>";
  html += "<label>Tank Height (cm)</label>";
  html += "<input type=\"number\" name=\"tankHeight\" step=\"0.1\" min=\"10\" max=\"500\" value=\"" + tankHeightStr + "\">";
  html += "<div class=\"hint\">Distance from the sensor (mounted at top) to the bottom of the empty tank. Used to calculate water level %.</div>";
  html += "</div>";

  html += "<button type=\"submit\">💾 Save &amp; Restart Device</button>";
  html += "</form>";

  html += "<div class=\"info-box\">📌 This Sensor's MAC Address:<br><span>" + WiFi.macAddress() + "</span><br><br>"
          "Paste this into the Relay's ESP-NOW Pairing field.<br><br>"
          "⚙️ Tank Height: <span>" + tankHeightStr + " cm</span> | "
          "Approx Level: <span>" + String(waterLevelPct, 1) + "%</span></div>";
  html += "</div></body></html>";

  server.send(200, "text/html", html);
}

// ==========================================
// HANDLE SAVING CONFIGURATION
// ==========================================
void handleSave() {
  if (server.hasArg("ssid"))        preferences.putString("ssid",       server.arg("ssid"));
  if (server.hasArg("password"))    preferences.putString("password",   server.arg("password"));
  if (server.hasArg("mqttServer"))  preferences.putString("mqttServer", server.arg("mqttServer"));
  if (server.hasArg("tankId"))      preferences.putString("tankId",     server.arg("tankId"));

  if (server.hasArg("relayMac") && server.arg("relayMac").length() == 17) {
    preferences.putString("relayMac", server.arg("relayMac"));
  }

  if (server.hasArg("tankHeight")) {
    float val = server.arg("tankHeight").toFloat();
    if (val >= 10.0 && val <= 500.0) {
      preferences.putFloat("tankHeight", val);
    }
  }

  String html = "<html><body style=\"background:#0f172a;color:#10b981;font-family:sans-serif;text-align:center;padding:50px;\">";
  html += "<h2>✅ Configuration Saved!</h2><p>The Sensor is restarting and connecting to your network.</p></body></html>";

  server.send(200, "text/html", html);
  delay(1000);
  ESP.restart();
}

// ==========================================
// MQTT RECONNECT
// ==========================================
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection...");
    String clientId = "SensorClient-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected ✓");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5s");
      delay(5000);
    }
  }
}

// ==========================================
// MAIN SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n========== SENSOR BOOT ==========");

  // Initialize Pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(configPin, INPUT_PULLUP);

  // Load config from NVS
  preferences.begin("app-config", false);
  ssid         = preferences.getString("ssid", "");
  password     = preferences.getString("password", "");
  mqttServer   = preferences.getString("mqttServer", "");
  tankId       = preferences.getString("tankId", "");
  tankHeightCm = preferences.getFloat("tankHeight", 100.0);
  String storedMac = preferences.getString("relayMac", "");

  if (mqttServer == "") mqttServer = "broker.hivemq.com";

  Serial.printf("[TANK] Height configured: %.1f cm\n", tankHeightCm);

  // Load stored Relay MAC if available
  if (storedMac.length() == 17) {
    parseMacAddress(storedMac, relayMacAddress);
    Serial.println("[ESP-NOW] Loaded Relay MAC: " + storedMac);
  } else {
    Serial.println("[ESP-NOW] No Relay MAC stored yet. Using broadcast FF:FF:FF:FF:FF:FF");
  }

  if (ssid == "" || digitalRead(configPin) == LOW) {
    // ── CONFIG MODE (Access Point) ──
    configMode = true;
    Serial.println("[CONFIG] Starting Access Point 'Sensor-Setup'...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("Sensor-Setup");
    Serial.print("[CONFIG] Connect to: http://");
    Serial.println(WiFi.softAPIP());

    server.on("/", handleRoot);
    server.on("/save", HTTP_POST, handleSave);
    server.on("/reset", []() {
      preferences.clear();
      server.send(200, "text/plain", "Device Resetting...");
      delay(1000);
      ESP.restart();
    });
    server.begin();
  } else {
    // ── NORMAL OPERATION MODE ──
    Serial.println("[WiFi] Connecting to: " + ssid);

    // STEP 1: Connect WiFi in Station mode
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
      delay(500);
      Serial.print(".");
      retries++;
    }

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\n[WiFi] FAILED. Rebooting in 5s...");
      delay(5000);
      ESP.restart();
    }

    Serial.println("\n[WiFi] Connected ✓");
    Serial.println("[WiFi] IP:  " + WiFi.localIP().toString());
    Serial.println("[WiFi] MAC: " + WiFi.macAddress());

    // STEP 2: Setup MQTT
    publishTopic = "watermonitor/tank/" + tankId + "/level";
    mqttClient.setServer(mqttServer.c_str(), 1883);

    // STEP 3: Init ESP-NOW (MUST be after WiFi so channel matches)
    initESPNow();
  }
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  if (configMode) {
    server.handleClient();
    return;
  }

  // Auto-reconnect Wi-Fi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Disconnected, reconnecting...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // MQTT keep alive
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Non-blocking timer: Run every 5 seconds
  if (millis() - lastReadingTime >= 5000) {
    lastReadingTime = millis();

    // ── Read Ultrasonic Sensor ──
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration   = pulseIn(echoPin, HIGH);
    distanceCm = duration * SOUND_SPEED / 2;

    // ── Calculate Water Level Percentage ──
    // distance decreases as water rises (sensor is at top)
    waterLevelPct = ((tankHeightCm - distanceCm) / tankHeightCm) * 100.0;
    waterLevelPct = constrain(waterLevelPct, 0.0, 100.0); // clamp 0–100

    Serial.printf("[SENSOR] Distance: %.2f cm | Water Level: %.1f%%\n",
                  distanceCm, waterLevelPct);

    // ── PUBLISH via MQTT (Cloud) ──
    StaticJsonDocument<256> doc;
    doc["apiKey"]       = apiKey;
    doc["distance"]     = distanceCm;
    doc["waterLevel"]   = waterLevelPct;   // <-- now includes % level
    doc["tankHeight"]   = tankHeightCm;    // <-- useful for dashboard display

    String requestBody;
    serializeJson(doc, requestBody);

    if (mqttClient.publish(publishTopic.c_str(), requestBody.c_str())) {
      Serial.println("[MQTT] Published ✓");
    } else {
      Serial.println("[MQTT] Publish failed ✗");
    }

    // ── SEND via ESP-NOW (Local Direct) ──
    sendViaESPNow(distanceCm, waterLevelPct);
  }
}
