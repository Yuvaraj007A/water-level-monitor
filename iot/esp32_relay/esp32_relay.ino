// ============================================================
// ESP32 RELAY - Water Level Monitor
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

// ─── Tank Adjustment Variables (saved in NVS) ───────────────
float lowThresholdPct  = 20.0; // Default: 20%
float highThresholdPct = 90.0; // Default: 90%

// Hardware Pins (RELAY ONLY)
const int relayPin  = 4;
const int configPin = 0; // The built-in "BOOT" button on most ESP32 boards

// System States
bool configMode  = false;
bool espNowReady = false;
unsigned long lastMqttReconnectAttempt = 0;
unsigned long lastWiFiReconnectAttempt = 0;

// MQTT Topics automatically generated from tankId
String subscribeTopic = "";
String configTopic    = "";

// ==========================================
// ESP-NOW: Shared data structure
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
// ==========================================
#if ESP_IDF_VERSION >= ESP_IDF_VERSION_VAL(5, 0, 0)
void onDataRecv(const esp_now_recv_info_t *esp_now_info, const uint8_t *incomingData, int len) {
  const uint8_t *mac_addr = esp_now_info->src_addr;
#else
void onDataRecv(const uint8_t *mac_addr, const uint8_t *incomingData, int len) {
#endif
  memcpy(&espNowData, incomingData, sizeof(espNowData));

  Serial.println("\n[ESP-NOW] ── Local Signal Received ──");
  Serial.printf("[ESP-NOW] From MAC: %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac_addr[0], mac_addr[1], mac_addr[2],
                mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.printf("[ESP-NOW] Distance: %.2f cm | Water Level: %.1f%%\n",
                espNowData.distance, espNowData.waterLevelPct);
  Serial.printf("[TANK]    High threshold: ≥ %.1f%% | Low threshold: ≤ %.1f%%\n",
                highThresholdPct, lowThresholdPct);

  // ── LOCAL SAFETY AUTOMATION ──
  if (espNowData.waterLevelPct >= highThresholdPct) {
    digitalWrite(relayPin, LOW);
    Serial.println("[ESP-NOW] ⛔ Tank FULL → Motor OFF (local safety)");
  } else if (espNowData.waterLevelPct <= lowThresholdPct) {
    digitalWrite(relayPin, HIGH);
    Serial.println("[ESP-NOW] ✅ Tank EMPTY → Motor ON (local auto-fill)");
  } else {
    Serial.println("[ESP-NOW] ℹ️  Level normal → No change");
  }
}

// ==========================================
// INITIALIZE ESP-NOW
// ==========================================
void initESPNow() {
  if (esp_now_init() != ESP_OK) {
    Serial.println("[ESP-NOW] Initialization FAILED");
    return;
  }

#if ESP_IDF_VERSION >= ESP_IDF_VERSION_VAL(5, 0, 0)
  esp_now_register_recv_cb(onDataRecv);
#else
  esp_now_register_recv_cb(esp_now_recv_cb_t(onDataRecv));
#endif

  espNowReady = true;
  Serial.print("[ESP-NOW] Ready! Listening on WiFi Channel: ");
  Serial.println(WiFi.channel());
  Serial.print("[ESP-NOW] Relay MAC Address: ");
  Serial.println(WiFi.macAddress());
}

// ==========================================
// MQTT CALLBACK 
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
  } else if (String(topic) == configTopic) {
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, message);
    if (!error) {
       if (doc.containsKey("lowThreshold"))  lowThresholdPct  = doc["lowThreshold"];
       if (doc.containsKey("highThreshold")) highThresholdPct = doc["highThreshold"];
       
       preferences.putFloat("lowThreshold",  lowThresholdPct);
       preferences.putFloat("highThreshold", highThresholdPct);
       
       Serial.printf("[Cloud Config] Updated thresholds: Low=%.1f%%, High=%.1f%%\n", 
                     lowThresholdPct, highThresholdPct);
    }
  }
}

// ==========================================
// MQTT RECONNECT
// ==========================================
void reconnectMQTT() {
  if (millis() - lastMqttReconnectAttempt > 5000) {
    lastMqttReconnectAttempt = millis();
    Serial.print("[MQTT] Attempting connection...");
    String clientId = "RelayClient-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected ✓");
      mqttClient.subscribe(subscribeTopic.c_str());
      mqttClient.subscribe(configTopic.c_str());
      Serial.println("[MQTT] Subscribed to commands and config");
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
    }
  }
}

// ==========================================
// ADMIN DASHBOARD HTML
// ==========================================
void handleRoot() {
  bool motorOn = digitalRead(relayPin) == HIGH;

  String html = R"rawliteral(
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relay Setup</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #f8fafc; margin: 0; padding: 20px; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.container { width: 100%; max-width: 440px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); box-sizing: border-box; }
h2 { color: #fff; margin-top: 0; font-weight: 800; font-size: 28px; letter-spacing: -0.5px; }
h2 span { color: #f59e0b; }
.badge { display: inline-block; background: rgba(245, 158, 11, 0.2); color: #fcd34d; font-size: 11px; font-weight: 800; border-radius: 20px; padding: 6px 14px; margin-bottom: 24px; letter-spacing: 1px; }
.section { background: rgba(15, 23, 42, 0.5); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: left; border: 1px solid rgba(255, 255, 255, 0.02); }
.section-title { color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
label { display: block; margin-bottom: 6px; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
input { width: 100%; padding: 14px 16px; margin-bottom: 16px; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; border-radius: 12px; font-size: 15px; font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
input:focus { outline: none; border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
.hint { font-size: 12px; color: #64748b; margin-top: -10px; margin-bottom: 16px; }
button { width: 100%; padding: 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; border: none; border-radius: 14px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); }
.status { display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border-radius: 14px; padding: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); }
.status-label { font-size: 13px; font-weight: 600; color: #94a3b8; }
.pill { padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 12px; letter-spacing: 1px; }
.pill-on { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
.pill-off { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
.info-box { background: rgba(0,0,0,0.2); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
.info-box span { color: #fcd34d; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; }
</style></head><body>
<div class="container">
<h2><span>⚡</span> Relay Setup</h2>
<div class="badge">WIFI • MQTT • ESP-NOW</div>
)rawliteral";

  html += "<div class=\"status\">";
  html += "<span class=\"status-label\">Motor Status</span>";
  if (motorOn) html += "<span class=\"pill pill-on\">ON</span>";
  else         html += "<span class=\"pill pill-off\">OFF</span>";
  html += "</div>";

  html += "<form action=\"/save\" method=\"POST\">";
  
  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🌐 Network</div>";
  html += "<label>WiFi SSID</label><input type=\"text\" name=\"ssid\" placeholder=\"Home Network\" value=\"" + ssid + "\">";
  html += "<label>WiFi Password</label><input type=\"password\" name=\"password\" placeholder=\"***\" value=\"" + password + "\">";
  html += "<label>MQTT Broker</label><input type=\"text\" name=\"mqttServer\" placeholder=\"broker.hivemq.com\" value=\"" + mqttServer + "\">";
  html += "<label>Tank ID (Database)</label><input type=\"text\" name=\"tankId\" placeholder=\"Paste ID here...\" value=\"" + tankId + "\">";
  html += "</div>";

  html += "<div class=\"section\">";
  html += "<div class=\"section-title\">🪣 Automation Thresholds</div>";
  html += "<label>Low Trigger (%)</label>";
  html += "<input type=\"number\" name=\"lowThreshold\" step=\"0.1\" min=\"0\" max=\"50\" value=\"" + String(lowThresholdPct, 1) + "\">";
  html += "<div class=\"hint\">Starts motor when level falls below this %</div>";
  html += "<label>High Stop (%)</label>";
  html += "<input type=\"number\" name=\"highThreshold\" step=\"0.1\" min=\"60\" max=\"100\" value=\"" + String(highThresholdPct, 1) + "\">";
  html += "<div class=\"hint\">Stops motor when level exceeds this %</div>";
  html += "</div>";

  html += "<button type=\"submit\">Save & Restart</button>";
  html += "</form>";

  html += "<div class=\"info-box\">Device MAC Address<br><span>" + WiFi.macAddress() + "</span></div>";
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

  if (server.hasArg("lowThreshold")) {
    float val = server.arg("lowThreshold").toFloat();
    if (val >= 0.0 && val <= 50.0) {
      preferences.putFloat("lowThreshold", val);
    }
  }

  if (server.hasArg("highThreshold")) {
    float val = server.arg("highThreshold").toFloat();
    if (val >= 60.0 && val <= 100.0) {
      preferences.putFloat("highThreshold", val);
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

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Default: motor OFF on boot

  pinMode(configPin, INPUT_PULLUP);

  preferences.begin("app-config", false);
  ssid         = preferences.getString("ssid", "");
  password     = preferences.getString("password", "");
  mqttServer      = preferences.getString("mqttServer", "");
  tankId          = preferences.getString("tankId", "");
  lowThresholdPct  = preferences.getFloat("lowThreshold", 20.0);
  highThresholdPct = preferences.getFloat("highThreshold", 90.0);

  if (mqttServer == "") mqttServer = "broker.hivemq.com";

  Serial.printf("[TANK] Low threshold: %.1f%% | High threshold: %.1f%%\n",
                lowThresholdPct, highThresholdPct);

  if (ssid == "" || digitalRead(configPin) == LOW) {
    configMode = true;
    Serial.println("[CONFIG] Starting Access Point 'Relay-Setup'...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("Relay-Setup");
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
    Serial.println("[CONFIG] -> Connect to Wi-Fi 'Relay-Setup' on your phone/PC.");
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
      Serial.println("[WiFi] MAC: " + WiFi.macAddress());
    }

    subscribeTopic = "watermonitor/tank/" + tankId + "/motor";
    configTopic    = "watermonitor/tank/" + tankId + "/config";
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

  // Auto-reconnect Wi-Fi
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWiFiReconnectAttempt > 5000) {
      lastWiFiReconnectAttempt = millis();
      Serial.println("[WiFi] Disconnected, attempting reconnect...");
      WiFi.reconnect();
    }
  } else {
    // MQTT keep alive
    if (!mqttClient.connected()) {
      reconnectMQTT();
    } else {
      mqttClient.loop();
    }
  }
}