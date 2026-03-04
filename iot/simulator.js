// Simulated variables based on ESP32 code
const apiUrl = "http://localhost:5000/api/tank/update"; // using localhost for simulator
const apiKey = "esp32-secret-key-999";
const tankId = "60d5ecb8b392d71500000000"; // Dummy ID, replace with actual if backend strictly checks

// Simulates the loop() output
async function loop(distanceCm) {
    console.log(`\nDistance (cm): ${distanceCm}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                tankId: tankId,
                distance: distanceCm
            })
        });

        const data = await response.json().catch(() => null);

        console.log(`HTTP Response code: ${response.status}`);
        if (data) console.log(JSON.stringify(data));

        if (response.ok && data) {
            // Parse response to control virtual relay
            const motorStatus = data.motorStatus;
            if (motorStatus) {
                if (motorStatus === "ON") {
                    console.log("[Hardware Override] Relay PIN set to HIGH (Motor ON)");
                } else {
                    console.log("[Hardware Override] Relay PIN set to LOW (Motor OFF)");
                }
            }
        } else {
            console.log(`Error Response:`, data);
        }
    } catch (error) {
        console.log(`Error code: ${error.message}`);
    }
}

async function runSimulator() {
    console.log("Starting ESP32 Simulator...");
    console.log("Simulating WiFi Connection...");
    console.log("Connected to WiFi network with IP Address: 192.168.1.100\n");

    // Simulate water levels changing over time
    const distances = [80, 50, 20, 10, 5, 20, 50, 80];

    for (let i = 0; i < distances.length; i++) {
        await loop(distances[i]);
        // Simulate delay(5000)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("\nSimulator finished.");
}

runSimulator();
