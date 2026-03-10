// Simulated variables based on ESP32 code
const mqtt = require('mqtt');
const mqttServer = "mqtt://broker.hivemq.com";
const apiKey = "esp32-secret-key-999";
const tankId = "60d5ecb8b392d71500000000"; // Dummy ID, replace with actual if backend strictly checks

const publishTopic = `watermonitor/tank/${tankId}/level`;
const subscribeTopic = `watermonitor/tank/${tankId}/motor`;

const client = mqtt.connect(mqttServer);

client.on('connect', () => {
    console.log("Connected to MQTT Broker:", mqttServer);
    client.subscribe(subscribeTopic, (err) => {
        if (!err) {
            console.log("Subscribed to topic:", subscribeTopic);
        } else {
            console.log("Failed to subscribe:", err);
        }
    });

    // Start simulation when connected
    runSimulator();
});

client.on('message', (topic, message) => {
    console.log(`\n[MQTT] Message arrived on topic: ${topic}. Message: ${message.toString()}`);
    if (topic === subscribeTopic) {
        const msg = message.toString();
        if (msg === "ON") {
            console.log("Motor turned ON via MQTT");
            console.log("[Hardware Override] Relay PIN set to HIGH (Motor ON)");
        } else if (msg === "OFF") {
            console.log("Motor turned OFF via MQTT");
            console.log("[Hardware Override] Relay PIN set to LOW (Motor OFF)");
        }
    }
});

client.on('error', (err) => {
    console.log("MQTT Error:", err);
});

// Simulates the loop() output
async function loop(distanceCm) {
    console.log(`\nDistance (cm): ${distanceCm}`);

    const payload = JSON.stringify({
        apiKey: apiKey,
        distance: distanceCm
    });

    client.publish(publishTopic, payload, (err) => {
        if (err) {
            console.log("Failed to publish reading:", err);
        } else {
            console.log(`Published level reading to MQTT`);
        }
    });
}

async function runSimulator() {
    console.log("Starting ESP32 Simulator (MQTT Mode)...");
    console.log("Simulating WiFi Connection...");
    console.log("Connected to WiFi network with IP Address: 192.168.1.100\n");

    // Simulate water levels changing over time
    const distances = [80, 50, 20, 10, 5, 20, 50, 80];

    for (let i = 0; i < distances.length; i++) {
        await loop(distances[i]);
        // Simulate delay(5000)
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log("\nSimulator finished sending readings. Listening for incoming MQTT messages...");
}
