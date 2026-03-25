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
#include <DNSServer.h>

// Initialize WebServer on port 80 and Non-Volatile Storage (Preferences)
WebServer server(80);
DNSServer dnsServer;
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
float tankHeightCm = 100.0; // Default: 100 cm tall tank

// Hardware Pins (SENSOR ONLY)
const int trigPin   = 5;
const int echoPin   = 18;
const int configPin = 0; // The built-in "BOOT" button on most ESP32 boards

// Sound speed for ultrasonic
#define SOUND_SPEED 0.034

long  duration;
float distanceCm;
float waterLevelPct;

// System States & Non-blocking Timers
bool configMode  = false;
bool espNowReady = false;
unsigned long lastReadingTime = 0;
unsigned long lastMqttReconnectAttempt = 0;
unsigned long lastWiFiReconnectAttempt = 0;

// MQTT Topics
String publishTopic = "";
String configTopic  = "";

// ==========================================
// ESP-NOW: Shared data structure
// ==========================================
typedef struct espnow_message {
  float distance;
  float waterLevelPct;
  char  tankId[64];
  char  apiKey[64];
} espnow_message;

// Relay MAC Address (Target)
uint8_t relayMacAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// ==========================================
// ESP-NOW SEND CALLBACK
// ==========================================
#if ESP_IDF_VERSION >= ESP_IDF_VERSION_VAL(5, 0, 0)
void onDataSent(const esp_now_send_info_t *info, esp_now_send_status_t status) {
#else
void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
#endif
  Serial.print("[ESP-NOW] Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivered ✓" : "Failed ✗");
}

// ==========================================
// INITIALIZE ESP-NOW
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
// SEND READING VIA ESP-NOW
// ==========================================
void sendViaESPNow(float dist, float lvlPct) {
  if (!espNowReady) return;

  espnow_message msg;
  msg.distance      = dist;
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

  String html = R"rawliteral(
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sensor Setup</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #f8fafc; margin: 0; padding: 20px; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.container { width: 100%; max-width: 440px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); box-sizing: border-box; }
h2 { color: #fff; margin-top: 0; font-weight: 800; font-size: 28px; letter-spacing: -0.5px; }
h2 span { color: #3b82f6; }
.badge { display: inline-block; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-size: 11px; font-weight: 800; border-radius: 20px; padding: 6px 14px; margin-bottom: 24px; letter-spacing: 1px; }
.section { background: rgba(15, 23, 42, 0.5); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.02); }
.section-title { color: #3b82f6; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
label { display: block; margin-bottom: 6px; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
input { width: 100%; padding: 14px 16px; margin-bottom: 16px; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; border-radius: 12px; font-size: 15px; font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
input:focus { outline: none; border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
.hint { font-size: 12px; color: #64748b; margin-top: -10px; margin-bottom: 16px; }
button { width: 100%; padding: 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; border: none; border-radius: 14px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4); }
.info-box { background: rgba(0,0,0,0.2); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6; }
.info-box span { color: #bfdbfe; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; }
</style></head><body>
<div class="container">
<h2><span>📡</span> Sensor Setup</h2>
<div class="badge">WIFI • MQTT • ESP-NOW</div>
<form action="/save" method="POST">
)rawliteral";
  
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🌐 Network</div>";
  html += "<label>WiFi SSID</label><input type=\"text\" name=\"ssid\" placeholder=\"Home Network\" value=\"" + ssid + "\">";
  html += "<label>WiFi Password</label><input type=\"password\" name=\"password\" placeholder=\"***\" value=\"" + password + "\">";
  html += "<label>MQTT Broker</label><input type=\"text\" name=\"mqttServer\" placeholder=\"broker.hivemq.com\" value=\"" + mqttServer + "\">";
  html += "<label>Tank ID (Database)</label><input type=\"text\" name=\"tankId\" placeholder=\"Paste ID here...\" value=\"" + tankId + "\">";
  html += "</div>";

  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">📶 Direct Pairing</div>";
  html += "<label>Relay MAC Address</label>";
  html += "<input type=\"text\" name=\"relayMac\" placeholder=\"AA:BB:CC:DD:EE:FF\">";
  html += "<div class=\"hint\">Copy this from the Relay's setup page</div>";
  html += "</div>";

  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🪣 Calibration</div>";
  html += "<label>Tank Height (cm)</label>";
  html += "<input type=\"number\" name=\"tankHeight\" step=\"0.1\" min=\"10\" max=\"500\" value=\"" + tankHeightStr + "\">";
  html += "<div class=\"hint\">Distance from sensor to the bottom of the tank</div>";
  html += "</div>";

  html += "<button type=\"submit\">Save & Restart</button>";
  html += "</form>";

  html += "<div class=\"info-box\">Device MAC Address<br><span>" + WiFi.macAddress() + "</span><br><br>";
  html += "Height Calibration: <span>" + tankHeightStr + " cm</span><br>";
  html += "Current Level: <span>" + String(waterLevelPct, 1) + "%</span></div>";
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
// MQTT CALLBACK
// ==========================================
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];

  if (String(topic) == configTopic) {
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, message);
    if (!error) {
       if (doc.containsKey("tankHeight")) {
          tankHeightCm = doc["tankHeight"];
          preferences.putFloat("tankHeight", tankHeightCm);
          Serial.printf("[Cloud Config] Updated tankHeight: %.1f cm\n", tankHeightCm);
       }
    }
  }
}

// ==========================================
// MQTT RECONNECT (Non-Blocking)
// ==========================================
void reconnectMQTT() {
  if (millis() - lastMqttReconnectAttempt > 5000) {
    lastMqttReconnectAttempt = millis();
    Serial.print("[MQTT] Attempting connection...");
    String clientId = "SensorClient-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected ✓");
      mqttClient.subscribe(configTopic.c_str());
      Serial.println("[MQTT] Subscribed to config topic");
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
    }
  }
}

// ==========================================
// MAIN SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n========== SENSOR BOOT ==========");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(configPin, INPUT_PULLUP);

  preferences.begin("app-config", false);
  ssid         = preferences.getString("ssid", "");
  password     = preferences.getString("password", "");
  mqttServer   = preferences.getString("mqttServer", "");
  tankId       = preferences.getString("tankId", "");
  tankHeightCm = preferences.getFloat("tankHeight", 100.0);
  String storedMac = preferences.getString("relayMac", "");

  if (mqttServer == "") mqttServer = "broker.hivemq.com";

  Serial.printf("[TANK] Height configured: %.1f cm\n", tankHeightCm);

  if (storedMac.length() == 17) {
    parseMacAddress(storedMac, relayMacAddress);
    Serial.println("[ESP-NOW] Loaded Relay MAC: " + storedMac);
  } else {
    Serial.println("[ESP-NOW] No Relay MAC stored yet. Using broadcast FF:FF:FF:FF:FF:FF");
  }

  if (ssid == "" || digitalRead(configPin) == LOW) {
    configMode = true;
    Serial.println("[CONFIG] Starting Access Point 'Sensor-Setup'...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("Sensor-Setup");
    Serial.print("[CONFIG] Connect to: http://");
    Serial.println(WiFi.softAPIP());

    dnsServer.start(53, "*", WiFi.softAPIP());

    server.on("/", handleRoot);
    server.on("/save", HTTP_POST, handleSave);
    server.on("/reset", []() {
      preferences.clear();
      server.send(200, "text/plain", "Device Resetting...");
      delay(1000);
      ESP.restart();
    });

    server.onNotFound([]() {
      server.sendHeader("Location", "http://192.168.4.1/", true);
      server.send(302, "text/plain", "");
    });

    server.begin();
  } else {
    Serial.println("[WiFi] Connecting to: " + ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
      delay(500);
      Serial.print(".");
      retries++;
    }

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\n[WiFi] Initial connection failed. Will retry in background.");
    } else {
      Serial.println("\n[WiFi] Connected ✓");
      Serial.println("[WiFi] IP:  " + WiFi.localIP().toString());
    }

    publishTopic = "watermonitor/tank/" + tankId + "/level";
    configTopic  = "watermonitor/tank/" + tankId + "/config";
    mqttClient.setServer(mqttServer.c_str(), 1883);
    mqttClient.setCallback(mqttCallback);

    initESPNow();
  }
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  if (configMode) {
    dnsServer.processNextRequest();
    server.handleClient();
    return;
  }

  // 1. Non-blocking Wi-Fi Reconnect
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWiFiReconnectAttempt > 5000) { 
      lastWiFiReconnectAttempt = millis();
      Serial.println("[WiFi] Disconnected, attempting reconnect...");
      WiFi.reconnect();
    }
  } else {
    // 2. Non-blocking MQTT Reconnect
    if (!mqttClient.connected()) {
      reconnectMQTT();
    } else {
      mqttClient.loop();
    }
  }

  // 3. Sensor Reading & Publishing
  if (millis() - lastReadingTime >= 5000) {
    lastReadingTime = millis();

    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration   = pulseIn(echoPin, HIGH);
    distanceCm = duration * SOUND_SPEED / 2;

    waterLevelPct = ((tankHeightCm - distanceCm) / tankHeightCm) * 100.0;
    waterLevelPct = constrain(waterLevelPct, 0.0, 100.0);

    Serial.printf("[SENSOR] Distance: %.2f cm | Water Level: %.1f%%\n",
                  distanceCm, waterLevelPct);

    // ── SEND via ESP-NOW (Local Direct - Always attempts) ──
    sendViaESPNow(distanceCm, waterLevelPct);

    // ── PUBLISH via MQTT (Cloud - Only if connected) ──
    if (mqttClient.connected()) {
      JsonDocument doc;
      doc["apiKey"]     = apiKey;
      doc["distance"]   = distanceCm;
      doc["waterLevel"] = waterLevelPct;
      doc["tankHeight"] = tankHeightCm;

      String requestBody;
      serializeJson(doc, requestBody);

      if (mqttClient.publish(publishTopic.c_str(), requestBody.c_str())) {
        Serial.println("[MQTT] Published ✓");
      } else {
        Serial.println("[MQTT] Publish failed ✗");
      }
    }
  }
}