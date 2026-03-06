const mqtt = require('mqtt');
const Tank = require('../models/Tank');
const Log = require('../models/Log');

const mqttBrokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
const client = mqtt.connect(mqttBrokerUrl);

client.on('connect', () => {
    console.log(`Connected to MQTT Broker: ${mqttBrokerUrl}`);
    // Subscribe to all tank levels
    client.subscribe('watermonitor/tank/+/level', (err) => {
        if (err) {
            console.error('MQTT Subscription Error:', err);
        } else {
            console.log('Subscribed to watermonitor/tank/+/level');
        }
    });
});

client.on('message', async (topic, message) => {
    // Expected topic: watermonitor/tank/<tankId>/level
    const parts = topic.split('/');
    if (parts.length === 4 && parts[0] === 'watermonitor' && parts[1] === 'tank' && parts[3] === 'level') {
        const tankId = parts[2];
        try {
            const data = JSON.parse(message.toString());
            const distance = data.distance;
            const apiKey = data.apiKey;

            if (apiKey !== process.env.ESP32_API_KEY) {
                console.log('MQTT: Invalid API Key');
                return;
            }

            const tank = await Tank.findById(tankId);
            if (!tank) {
                console.log('MQTT: Tank not found');
                return;
            }

            let levelPercent = ((tank.tankHeight - distance) / tank.tankHeight) * 100;
            if (levelPercent > 100) levelPercent = 100;
            if (levelPercent < 0) levelPercent = 0;

            tank.currentLevel = Math.round(levelPercent);
            tank.waterVolume = Math.round((tank.currentLevel / 100) * tank.tankCapacityLiters);
            tank.lastUpdated = Date.now();

            let motorStatusBefore = tank.motorStatus;

            if (tank.automationEnabled) {
                if (tank.currentLevel < 20 && tank.motorStatus === 'OFF') {
                    tank.motorStatus = 'ON';
                } else if (tank.currentLevel > 95 && tank.motorStatus === 'ON') {
                    tank.motorStatus = 'OFF';
                }
            }

            await tank.save();

            // Always publish motor status back to the device to keep it in sync
            client.publish(`watermonitor/tank/${tankId}/motor`, tank.motorStatus);

            // Log if state changed or we just received an update
            await Log.create({
                tankId: tank._id,
                level: tank.currentLevel,
                motorStatus: tank.motorStatus
            });
        } catch (error) {
            console.error('MQTT Message Handling Error:', error.message);
        }
    }
});

module.exports = client;
