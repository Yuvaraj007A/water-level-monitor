#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>

// Initialize WebServer on port 80 and Non-Volatile Storage (Preferences)
WebServer server(80);
Preferences preferences;

// Configuration Variables
String ssid = "";
String password = "";
String apiUrl = "";
String tankId = "";
const char *apiKey = "esp32-secret-key-999";

// Hardware Pins
const int trigPin = 5;
const int echoPin = 18;
const int relayPin = 4;
const int configPin = 0; // The built-in "BOOT" button on most ESP32 boards

// Sound speed for ultrasonic
#define SOUND_SPEED 0.034

long duration;
float distanceCm;

// System States
bool configMode = false;
unsigned long lastReadingTime = 0;

// ==========================================
// ADMIN DASHBOARD HTML
// ==========================================
void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta name=\"viewport\" "
                "content=\"width=device-width, initial-scale=1\">";
  html += "<title>ESP32 Admin Dashboard</title>";
  html += "<style>";
  html += "body { font-family: 'Segoe UI', Arial, sans-serif; "
          "background-color: #0f172a; color: #f8fafc; margin: 0; padding: "
          "20px; text-align: center; }";
  html += ".container { max-width: 400px; margin: 0 auto; background: #1e293b; "
          "padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px "
          "rgba(0,0,0,0.3); }";
  html += "h2 { color: #3b82f6; margin-top: 0; }";
  html += "label { display: block; text-align: left; margin-bottom: 5px; "
          "color: #94a3b8; font-size: 14px; }";
  html += "input { width: 100%; padding: 10px; margin-bottom: 20px; "
          "box-sizing: border-box; border: 1px solid #334155; background: "
          "#0f172a; color: white; border-radius: 6px; }";
  html += "button { width: 100%; padding: 12px; background: #3b82f6; color: "
          "white; border: none; border-radius: 6px; font-weight: bold; cursor: "
          "pointer; transition: 0.3s; }";
  html += "button:hover { background: #2563eb; }";
  html += "</style></head><body>";
  html += "<div class=\"container\"><h2>⚙️ Smart Setup</h2>";
  html += "<form action=\"/save\" method=\"POST\">";
  html += "<label>WiFi SSID Name</label><input type=\"text\" name=\"ssid\" "
          "placeholder=\"Your Home Wi-Fi\" value=\"" +
          ssid + "\">";
  html += "<label>WiFi Password</label><input type=\"password\" "
          "name=\"password\" placeholder=\"***\" value=\"" +
          password + "\">";
  html += "<label>Backend API URL</label><input type=\"text\" name=\"apiUrl\" "
          "placeholder=\"http://192.168.x.x:5000/api/tank/update\" value=\"" +
          apiUrl + "\">";
  html += "<label>Tank ID (MongoDB)</label><input type=\"text\" "
          "name=\"tankId\" placeholder=\"Paste Tank ID here...\" value=\"" +
          tankId + "\">";
  html += "<button type=\"submit\">Save & Restart Device</button>";
  html += "</form></div></body></html>";

  server.send(200, "text/html", html);
}

// ==========================================
// HANDLE SAVING CONFIGURATION
// ==========================================
void handleSave() {
  if (server.hasArg("ssid"))
    preferences.putString("ssid", server.arg("ssid"));
  if (server.hasArg("password"))
    preferences.putString("password", server.arg("password"));
  if (server.hasArg("apiUrl"))
    preferences.putString("apiUrl", server.arg("apiUrl"));
  if (server.hasArg("tankId"))
    preferences.putString("tankId", server.arg("tankId"));

  String html = "<html><body style=\"background:#0f172a; color:#10b981; "
                "font-family:sans-serif; text-align:center; padding:50px;\">";
  html += "<h2>✅ Configuration Saved!</h2><p>The ESP32 is restarting and "
          "connecting to your network.</p></body></html>";

  server.send(200, "text/html", html);

  delay(1000); // Give the browser time to receive the page
  ESP.restart();
}

// ==========================================
// MAIN SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  // Initialize Pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);

  // BOOT pin used for forcing config mode (Pullup usually inside, but we
  // specify)
  pinMode(configPin, INPUT_PULLUP);

  // Open temporary storage "app-config"
  preferences.begin("app-config", false);
  ssid = preferences.getString("ssid", "");
  password = preferences.getString("password", "");
  apiUrl = preferences.getString("apiUrl", "");
  tankId = preferences.getString("tankId", "");

  // If there's no SSID saved OR the BOOT button is held down while turning on
  if (ssid == "" || digitalRead(configPin) == LOW) {
    configMode = true;

    Serial.println("Starting ESP32 Admin Dashboard (Access Point Mode)...");

    // Create ESP32 Wi-Fi Network
    WiFi.softAP("WaterMonitor-Setup");

    Serial.print("IP Address for Setup: http://");
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

    Serial.println("-> Connect to Wi-Fi 'WaterMonitor-Setup' on your phone/PC "
                   "to configure.");
  } else {
    // Normal Operation Mode
    Serial.println("Connecting to saved Wi-Fi: " + ssid);
    WiFi.begin(ssid.c_str(), password.c_str());

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
      delay(500);
      Serial.print(".");
      retries++;
    }

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\nFailed to connect. Will retry in 5 seconds...");
      return;
    }

    Serial.println("\nConnected to WiFi!");
    Serial.println("IP Address: " + WiFi.localIP().toString());
  }
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  // If we are in AP setup mode, just handle the webpage and skip everything
  // else
  if (configMode) {
    server.handleClient();
    return;
  }

  // Auto-reconnect Wi-Fi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // Non-blocking timer: Run logic every 5 seconds
  if (millis() - lastReadingTime >= 5000) {
    lastReadingTime = millis();

    // Trigger Ultrasonic
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // Calculate distance
    duration = pulseIn(echoPin, HIGH);
    distanceCm = duration * SOUND_SPEED / 2;

    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);

    // Send HTTP POST
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    StaticJsonDocument<200> doc;
    doc["tankId"] = tankId;
    doc["distance"] = distanceCm;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String payload = http.getString();
      Serial.println("HTTP " + String(httpResponseCode) +
                     " Response: " + payload);

      StaticJsonDocument<200> responseDoc;
      if (!deserializeJson(responseDoc, payload)) {
        String motorStatus = responseDoc["motorStatus"].as<String>();
        if (motorStatus == "ON") {
          digitalWrite(relayPin, HIGH); // Motor ON
        } else {
          digitalWrite(relayPin, LOW); // Motor OFF
        }
      }
    } else {
      Serial.println("HTTP Error: " + String(httpResponseCode));
    }

    http.end();
  }
}
