// ============================================================
// ESP32 RELAY - Water Level Monitor
// Protocols: WiFi + MQTT (Cloud) + ESP-NOW (Local/Direct)
// ============================================================
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

// ─── Tank Adjustment Variables (saved in NVS) ───────────────
// Motor turns ON  when distance >= tankEmptyCm (water level is low)
// Motor turns OFF when distance <= tankFullCm  (water level is high)
float tankEmptyCm = 80.0; // Default: 80 cm = tank considered empty
float tankFullCm  = 10.0; // Default: 10 cm = tank considered full

// Hardware Pins (RELAY ONLY)
const int relayPin  = 4;
const int configPin = 0; // The built-in "BOOT" button on most ESP32 boards

// System States
bool configMode  = false;
bool espNowReady = false;

// MQTT Topics automatically generated from tankId
String subscribeTopic = "";

// ==========================================
// ESP-NOW: Shared data structure
// MUST match the exact same struct in esp32_sensor.ino
// ==========================================
typedef struct espnow_message {
  float distance;
  float waterLevelPct;
  char  tankId[64];
  char  apiKey[64];
} espnow_message;

espnow_message espNowData;

// ==========================================
// ESP-NOW RECEIVE CALLBACK
// Triggered when sensor sends a direct local reading
// ==========================================
void onDataRecv(const uint8_t *mac_addr, const uint8_t *incomingData, int len) {
  memcpy(&espNowData, incomingData, sizeof(espNowData));

  Serial.println("\n[ESP-NOW] ── Local Signal Received ──");
  Serial.printf("[ESP-NOW] From MAC: %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac_addr[0], mac_addr[1], mac_addr[2],
                mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.printf("[ESP-NOW] Distance: %.2f cm | Water Level: %.1f%%\n",
                espNowData.distance, espNowData.waterLevelPct);
  Serial.printf("[TANK]    Full threshold: ≤ %.1f cm | Empty threshold: ≥ %.1f cm\n",
                tankFullCm, tankEmptyCm);

  // ── LOCAL SAFETY AUTOMATION ──
  // This logic runs even if MQTT / Internet is completely down!
  if (espNowData.distance > 0 && espNowData.distance <= tankFullCm) {
    // Water very close to sensor → TANK IS FULL → Stop motor
    digitalWrite(relayPin, LOW);
    Serial.println("[ESP-NOW] ⛔ Tank FULL → Motor OFF (local safety)");

  } else if (espNowData.distance >= tankEmptyCm) {
    // Water very far from sensor → TANK IS EMPTY → Start motor
    digitalWrite(relayPin, HIGH);
    Serial.println("[ESP-NOW] ✅ Tank EMPTY → Motor ON (local auto-fill)");

  } else {
    // Water level is between thresholds → maintain current state
    Serial.println("[ESP-NOW] ℹ️  Level normal → No change");
  }
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

  esp_now_register_recv_cb(esp_now_recv_cb_t(onDataRecv));

  espNowReady = true;
  Serial.print("[ESP-NOW] Ready! Listening on WiFi Channel: ");
  Serial.println(WiFi.channel());
  Serial.print("[ESP-NOW] Relay MAC Address: ");
  Serial.println(WiFi.macAddress());
}

// ==========================================
// MQTT CALLBACK (When message arrives from cloud/dashboard)
// ==========================================
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("\n[MQTT] ── Cloud Command ──");
  Serial.println("[MQTT] Topic: " + String(topic));
  Serial.println("[MQTT] Message: " + message);

  if (String(topic) == subscribeTopic) {
    if (message == "ON") {
      digitalWrite(relayPin, HIGH);
      Serial.println("[MQTT] Motor turned ON (Cloud override) ✓");
    } else if (message == "OFF") {
      digitalWrite(relayPin, LOW);
      Serial.println("[MQTT] Motor turned OFF (Cloud override) ✓");
    }
  }
}

// ==========================================
// MQTT RECONNECT
// ==========================================
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection...");
    String clientId = "RelayClient-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected ✓");
      mqttClient.subscribe(subscribeTopic.c_str());
      Serial.println("[MQTT] Subscribed to: " + subscribeTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5s");
      delay(5000);
    }
  }
}

// ==========================================
// ADMIN DASHBOARD HTML
// ==========================================
void handleRoot() {
  String emptyStr = String(tankEmptyCm, 1);
  String fullStr  = String(tankFullCm, 1);
  bool   motorOn  = digitalRead(relayPin) == HIGH;

  String html = "<!DOCTYPE html><html><head><meta name=\"viewport\" "
                "content=\"width=device-width, initial-scale=1\">";
  html += "<title>Relay Admin Dashboard</title>";
  html += "<style>";
  html += "body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#f8fafc;margin:0;padding:20px;text-align:center;}";
  html += ".container{max-width:440px;margin:0 auto;background:#1e293b;padding:30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.3);}";
  html += "h2{color:#f59e0b;margin-top:0;}";
  html += ".badge{display:inline-block;background:#78350f;color:#fde68a;font-size:11px;border-radius:6px;padding:2px 8px;margin-bottom:20px;}";
  html += ".section{background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;text-align:left;}";
  html += ".section-title{color:#f59e0b;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}";
  html += "label{display:block;text-align:left;margin-bottom:5px;color:#94a3b8;font-size:13px;}";
  html += "input{width:100%;padding:10px;margin-bottom:14px;box-sizing:border-box;border:1px solid #334155;background:#1e293b;color:white;border-radius:6px;font-size:14px;}";
  html += ".hint{font-size:11px;color:#475569;margin-top:-10px;margin-bottom:14px;text-align:left;}";
  html += "button{width:100%;padding:12px;background:#f59e0b;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer;transition:.3s;font-size:15px;}";
  html += "button:hover{background:#d97706;}";
  html += ".status{display:flex;align-items:center;justify-content:space-between;background:#0f172a;border-radius:8px;padding:12px 16px;margin-bottom:20px;}";
  html += ".status-label{font-size:13px;color:#94a3b8;}";
  html += ".pill{padding:4px 14px;border-radius:20px;font-weight:bold;font-size:13px;}";
  html += ".pill-on{background:#14532d;color:#4ade80;}";
  html += ".pill-off{background:#450a0a;color:#f87171;}";
  html += ".info-box{background:#0f172a;border:1px solid #44370f;border-radius:8px;padding:12px;margin-top:20px;font-size:12px;color:#64748b;text-align:left;}";
  html += ".info-box span{color:#f59e0b;font-weight:bold;font-size:13px;}";
  html += ".diagram{background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;font-size:12px;color:#64748b;text-align:left;line-height:1.8;}";
  html += ".diagram code{color:#38bdf8;}";
  html += "</style></head><body>";
  html += "<div class=\"container\">";
  html += "<h2>⚡ Relay Setup</h2>";
  html += "<div class=\"badge\">WiFi + MQTT + ESP-NOW</div>";

  // Live Motor Status
  html += "<div class=\"status\">";
  html += "<span class=\"status-label\">Motor Status</span>";
  if (motorOn) {
    html += "<span class=\"pill pill-on\">⚡ ON</span>";
  } else {
    html += "<span class=\"pill pill-off\">⭕ OFF</span>";
  }
  html += "</div>";

  html += "<form action=\"/save\" method=\"POST\">";

  // ── Network Settings ──
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🌐 Network Settings</div>";
  html += "<label>WiFi SSID</label><input type=\"text\" name=\"ssid\" placeholder=\"Your Home Wi-Fi\" value=\"" + ssid + "\">";
  html += "<label>WiFi Password</label><input type=\"password\" name=\"password\" placeholder=\"***\" value=\"" + password + "\">";
  html += "<label>MQTT Broker</label><input type=\"text\" name=\"mqttServer\" placeholder=\"broker.hivemq.com\" value=\"" + mqttServer + "\">";
  html += "<label>Tank ID (MongoDB)</label><input type=\"text\" name=\"tankId\" placeholder=\"Paste Tank ID here...\" value=\"" + tankId + "\">";
  html += "</div>";

  // ── Tank Adjustment ──
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🪣 Tank Thresholds (ESP-NOW Automation)</div>";

  // Visual diagram
  html += "<div class=\"diagram\">📐 How it works:<br>";
  html += "┌── Sensor (top) ──┐<br>";
  html += "│  <code>Tank Full</code> ≤ " + fullStr + "cm<br>";
  html += "│  ···· normal ····<br>";
  html += "│  <code>Tank Empty</code> ≥ " + emptyStr + "cm<br>";
  html += "└──── Tank Bottom ──┘</div>";

  html += "<label>Tank Empty Threshold (cm) → Motor turns ON</label>";
  html += "<input type=\"number\" name=\"tankEmpty\" step=\"0.1\" min=\"5\" max=\"500\" value=\"" + emptyStr + "\">";
  html += "<div class=\"hint\">If sensor distance ≥ this value, tank is empty → start motor.</div>";

  html += "<label>Tank Full Threshold (cm) → Motor turns OFF</label>";
  html += "<input type=\"number\" name=\"tankFull\" step=\"0.1\" min=\"1\" max=\"490\" value=\"" + fullStr + "\">";
  html += "<div class=\"hint\">If sensor distance ≤ this value, tank is full → stop motor.</div>";
  html += "</div>";

  html += "<button type=\"submit\">💾 Save &amp; Restart Device</button>";
  html += "</form>";

  html += "<div class=\"info-box\">📌 This Relay's MAC Address:<br><span>" + WiFi.macAddress() + "</span><br><br>"
          "Paste this into your Sensor's ESP-NOW Pairing field.</div>";
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

  if (server.hasArg("tankEmpty")) {
    float val = server.arg("tankEmpty").toFloat();
    if (val >= 5.0 && val <= 500.0) {
      preferences.putFloat("tankEmpty", val);
    }
  }

  if (server.hasArg("tankFull")) {
    float val = server.arg("tankFull").toFloat();
    if (val >= 1.0 && val <= 490.0) {
      preferences.putFloat("tankFull", val);
    }
  }

  String html = "<html><body style=\"background:#0f172a;color:#10b981;font-family:sans-serif;text-align:center;padding:50px;\">";
  html += "<h2>✅ Configuration Saved!</h2><p>The Relay is restarting and connecting to your network.</p></body></html>";

  server.send(200, "text/html", html);
  delay(1000);
  ESP.restart();
}

// ==========================================
// MAIN SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n========== RELAY BOOT ==========");

  // Initialize Pins
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Default: motor OFF on boot

  pinMode(configPin, INPUT_PULLUP);

  // Load config from NVS
  preferences.begin("app-config", false);
  ssid         = preferences.getString("ssid", "");
  password     = preferences.getString("password", "");
  mqttServer   = preferences.getString("mqttServer", "");
  tankId       = preferences.getString("tankId", "");
  tankEmptyCm  = preferences.getFloat("tankEmpty", 80.0);
  tankFullCm   = preferences.getFloat("tankFull",  10.0);

  if (mqttServer == "") mqttServer = "broker.hivemq.com";

  Serial.printf("[TANK] Empty threshold: %.1f cm | Full threshold: %.1f cm\n",
                tankEmptyCm, tankFullCm);

  if (ssid == "" || digitalRead(configPin) == LOW) {
    // ── CONFIG MODE (Access Point) ──
    configMode = true;
    Serial.println("[CONFIG] Starting Access Point 'Relay-Setup'...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("Relay-Setup");
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
    Serial.println("[CONFIG] -> Connect to Wi-Fi 'Relay-Setup' on your phone/PC.");
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
    subscribeTopic = "watermonitor/tank/" + tankId + "/motor";
    mqttClient.setServer(mqttServer.c_str(), 1883);
    mqttClient.setCallback(mqttCallback);

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

  // ESP-NOW fires onDataRecv automatically — no polling needed here
  mqttClient.loop();
}
