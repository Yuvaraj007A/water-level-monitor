# 📊 System Documentation Diagrams

This document contains the structural and behavioral diagrams for the **Smart Water Level Monitoring System**.

---

## 🏗️ 1. ER Diagram (Entity-Relationship)
This diagram shows the database schema and how entities are connected in MongoDB.

```mermaid
erDiagram
    USER ||--|| TANK : "owns"
    TANK ||--o{ LOG : "generates"

    USER {
        string _id PK
        string name
        string email
        string password "Hashed"
        string role
        date createdAt
    }

    TANK {
        string _id PK
        string userId FK
        float tankHeight "cm"
        float tankCapacityLiters "L"
        int currentLevel "%"
        float waterVolume "L"
        string motorStatus "ON/OFF"
        boolean automationEnabled
        date lastUpdated
    }

    LOG {
        string _id PK
        string tankId FK
        int level "%"
        string motorStatus "ON/OFF"
        timestamp timestamp "TS Core"
    }
```

---

## 🧬 2. UML Class Diagram (Backend Architecture)
This shows the structure of the data models and their associated methods.

```mermaid
classDiagram
    class User {
        +String name
        +String email
        -String password
        +String role
        +matchPassword(enteredPassword)
    }

    class Tank {
        +ObjectId userId
        +Number tankHeight
        +Number tankCapacityLiters
        +Number currentLevel
        +String motorStatus
        +Boolean automationEnabled
        +save()
    }

    class Log {
        +ObjectId tankId
        +Number level
        +String motorStatus
        +Date timestamp
    }

    User "1" *-- "1" Tank : owns
    Tank "1" *-- "many" Log : history
```

---

## 🔄 3. Data Flow Diagram (DFD Level-1)
This diagram shows how data moves through the system from the sensor hardware to the user.

```mermaid
graph LR
    subgraph "Hardware (Local)"
        S[Ultrasonic Sensor] -- "Distance (cm)" --> ESP_S[ESP32 Sensor]
    end

    ESP_S -- "ESP-NOW (Direct Signal)" --> ESP_R[ESP32 Relay]
    ESP_R -- "GPIO Control" --> M[Water Pump Motor]

    subgraph "Cloud / Backend"
        ESP_S -- "MQTT Publish" --> MB[MQTT Broker]
        MB -- "MQTT Subscribe" --> BE[Node.js API]
        BE -- "CRUD Operations" --> DB[(MongoDB Atlas)]
    end

    subgraph "Client Side"
        UI[React Dashboard] -- "REST API (GET/POST)" --> BE
        UI -- "Live Updates" --> UI_Level[Tank Visualizer]
    end
```

---

## ⏱️ 4. Sequence Diagram (Real-time Interaction)
How the components communicate during a typical water level update cycle.

```mermaid
sequenceDiagram
    participant S as ESP32 Sensor
    participant R as ESP32 Relay
    participant B as Backend (Express)
    participant M as MQTT Broker
    participant DB as MongoDB
    participant F as React Frontend

    Note over S,R: Local Automation Path
    S->>R: ESP-NOW (Distance Data)
    alt Distance > Empty Threshold
        R->>R: Motor ON (GPIO High)
    else Distance < Full Threshold
        R->>R: Motor OFF (GPIO Low)
    end

    Note over S,F: Cloud Path
    S->>M: Publish Level Update
    M->>B: Trigger MQTT Subscriber
    B->>DB: Update Tank State & Write Log
    B->>M: Publish Motor Command (Sync)
    M->>R: Receive Command
    
    Note over F,B: User View
    F->>B: GET /api/tank (Polling)
    B->>F: Latest Level & Motor Status
    F->>F: Update Dashboard UI
```

---

## 🔌 5. System State Diagram (Motor Logic)
Describes the states and transitions of the water pump motor.

```mermaid
stateDiagram-v2
    [*] --> MotorOFF : Default

    state MotorOFF {
        [*] --> Idle
    }

    state MotorON {
        [*] --> Pumping
    }

    MotorOFF --> MotorON : Level < 20% (Auto)
    MotorOFF --> MotorON : User Toggle "ON" (Manual)
    
    MotorON --> MotorOFF : Level > 95% (Auto)
    MotorON --> MotorOFF : User Toggle "OFF" (Manual)
    
    MotorON --> MotorOFF : Distance <= FullThreshold (Local Safety)
    MotorOFF --> MotorON : Distance >= EmptyThreshold (Local AutoFill)
```

---

## 🔌 6. Circuit Schematic (Hardware Setup)

The system consists of two separate ESP32 units. Below are the wiring instructions for each.

### 📡 Unit A: Sensor Node (Remote/Tank Location)
This unit is responsible for measuring the water level and transmitting data wirelessly.

| Component | ESP32 Pin | Component Pin | Notes |
| :--- | :--- | :--- | :--- |
| **HC-SR04** | 5 (GPIO 5) | Trig | Trigger Pin |
| **HC-SR04** | 18 (GPIO 18) | Echo | Echo Pin |
| **HC-SR04** | Vin / 5V | VCC | 5V Required |
| **HC-SR04** | GND | GND | Common Ground |
| **Config Button**| 0 (GPIO 0) | Pin 1 | Uses internal Pull-up (BOOT button) |

```mermaid
graph LR
    subgraph "ESP32 Sensor Unit"
        ESP_S[ESP32 Development Board]
        HC[HC-SR04 Ultrasonic Sensor]
        B[BOOT Button / Config]
        
        ESP_S -- "GPIO 5" --> HC_TRIG[Trig]
        ESP_S -- "GPIO 18" --> HC_ECHO[Echo]
        ESP_S -- "5V/Vin" --> HC_VCC[VCC]
        ESP_S -- "GND" --> HC_GND[GND]
        ESP_S -- "GPIO 0" --> B
    end
```

### ⚡ Unit B: Relay Node (Motor/Pump Location)
This unit receives signals and controls the high-voltage water pump.

| Component | ESP32 Pin | Component Pin | Notes |
| :--- | :--- | :--- | :--- |
| **Relay Module**| 4 (GPIO 4) | IN / Sig | Controls the relay coil |
| **Relay Module**| Vin / 5V | VCC | 5V for Relay Coil |
| **Relay Module**| GND | GND | Common Ground |
| **Config Button**| 0 (GPIO 0) | Pin 1 | Uses internal Pull-up (BOOT button) |

```mermaid
graph TD
    subgraph "ESP32 Relay Unit"
        ESP_R[ESP32 Development Board]
        RELAY[Relay Module]
        MOTOR[Water Pump]
        AC[220V/110V AC Power]
        
        ESP_R -- "GPIO 4" --> RELAY_IN[Signal IN]
        ESP_R -- "5V" --> RELAY_VCC[VCC]
        ESP_R -- "GND" --> RELAY_GND[GND]
        
        AC -- "Live" --> RELAY_COM[COM]
        RELAY_NO[Normally Open] -- "Switched Live" --> MOTOR
        MOTOR -- "Neutral" --> AC_N[Neutral]
    end
```

> [!CAUTION]
> **HIGH VOLTAGE WARNING**: The Relay Unit involves switching AC Mains (110V/220V). Ensure all connections are insulated and the project is housed in a non-conductive enclosure. Never touch the relay contacts while connected to power.

