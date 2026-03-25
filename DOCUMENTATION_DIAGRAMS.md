# Water Level Monitor - System Diagrams

## 1. ER Diagram (Entity-Relationship)

```mermaid
erDiagram
    USER ||--o{ TANK : "owns"
    USER ||--o{ USER_SETTINGS : "has"
    TANK ||--o{ TANK_CONFIG : "has"
    TANK ||--o{ LOG : "generates"
    TANK ||--o{ MOTOR_COMMAND : "receives"
    TANK {
        ObjectId _id PK
        ObjectId userId FK
        float tankHeight "cm"
        float tankCapacityLiters "L"
        int currentLevel "%"
        float waterVolume "L"
        string motorStatus "ON|OFF"
        boolean automationEnabled
        float emptyThreshold "%"
        float fullThreshold "%"
        date lastUpdated
    }
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "user|admin"
        boolean emailNotifications
        boolean pushNotifications
        date createdAt
        date lastLogin
    }
    
    USER_SETTINGS {
        ObjectId _id PK
        ObjectId userId FK UK
        string notificationLevel "low|critical|all"
        string theme "light|dark|auto"
        int refreshInterval "seconds"
    }
    
    TANK_CONFIG {
        ObjectId _id PK
        ObjectId tankId FK UK
        string esp32MacAddress
        string apiKey
        int readingInterval "seconds"
        float hysteresisOffset "%"
    }
    
    LOG {
        ObjectId _id PK
        ObjectId tankId FK
        int level "%"
        float distance "cm"
        float waterVolume "L"
        string motorStatus "ON|OFF"
        string trigger "auto|manual|esp32"
        date timestamp
    }
    
    MOTOR_COMMAND {
        ObjectId _id PK
        ObjectId tankId FK
        string command "ON|OFF"
        string source "cloud|local|api"
        date timestamp
    }
```

---

## 2. UML Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        -String passwordHash
        +String role
        +Boolean emailNotifications
        +Boolean pushNotifications
        +Date createdAt
        +Date lastLogin
        +Promise~User~ register(String email, String password)
        +Promise~User~ login(String email, String password)
        +Promise~Token~ generateAuthToken()
        +Boolean comparePassword(String enteredPassword)
    }
    
    class Tank {
        +ObjectId _id
        +ObjectId userId
        +Number tankHeight
        +Number tankCapacityLiters
        +Number currentLevel
        +Number waterVolume
        +String motorStatus
        +Boolean automationEnabled
        +Number emptyThreshold
        +Number fullThreshold
        +Date lastUpdated
        +Promise~Tank~ save()
        +Promise~Tank~ updateLevel(Number distance)
        +Promise~Tank~ toggleMotor(String status)
        +Number calculateWaterVolume()
    }
    
    class Log {
        +ObjectId _id
        +ObjectId tankId
        +Number level
        +Number distance
        +Number waterVolume
        +String motorStatus
        +String trigger
        +Date timestamp
        +Promise~Log~ static create(data)
        +Promise~Array~ getHistory(Date start, Date end)
    }
    
    class TankConfig {
        +ObjectId _id
        +ObjectId tankId
        +String esp32MacAddress
        +String apiKey
        +Number readingInterval
        +Number hysteresisOffset
        +Promise~TankConfig~ updateSettings(Object settings)
    }
    
    class MQTTService {
        -MqttClient client
        -String brokerUrl
        +void connect()
        +void subscribe(String topic)
        +void publish(String topic, String payload)
        +void onMessage(Function callback)
        +void onMotorCommand(Function handler)
    }
    
    class AnalyticsController {
        +Promise~Object~ getDailyUsage(String tankId, Date date)
        +Promise~Object~ getWeeklyUsage(String tankId)
        +Promise~Object~ getMonthlyUsage(String tankId)
        +Promise~Array~ getUsageTrends(String tankId, Number days)
        +Promise~Object~ detectAnomalies(String tankId)
    }
    
    User "1" --> "*" Tank : owns
    User "1" --> "1" UserSettings : has
    Tank "1" --> "1" TankConfig : configured by
    Tank "1" --> "*" Log : generates
    Tank "1" --> "*" MotorCommand : receives
    MQTTService ..> Tank : updates
    MQTTService ..> MotorCommand : publishes
    AnalyticsController ..> Log : queries
    AnalyticsController ..> Tank : analyzes
```

---

## 3. Data Flow Diagram (DFD Level 0 - Context Diagram)

```mermaid
flowchart LR
    subgraph External_Entities
        ESP32_SENSOR["ESP32 Sensor\n(HC-SR04)"]
        ESP32_RELAY["ESP32 Relay\n(Motor Control)"]
        USER["User\n(Dashboard)"]
        MQTT_BROKER["MQTT Broker\n(Cloud)"]
    end
    
    subgraph System_Processes
        WATER_MONITOR["Water Level Monitor System"]
    end
    
    subgraph Data_Stores
        DATABASE[(MongoDB\nDatabase)]
    end
    
    ESP32_SENSOR -->|Level Data| WATER_MONITOR
    WATER_MONITOR -->|Motor Commands| ESP32_RELAY
    USER -->|Requests| WATER_MONITOR
    WATER_MONITOR -->|Dashboard Data| USER
    WATER_MONITOR <-->|MQTT Pub/Sub| MQTT_BROKER
    WATER_MONITOR -->|CRUD| DATABASE
```

---

## 4. Data Flow Diagram (DFD Level 1)

```mermaid
flowchart TD
    subgraph External
        ESP_S["ESP32 Sensor"]
        ESP_R["ESP32 Relay"]
        USER["User"]
    end
    
    subgraph P1_Auth
        AUTH_ENT["Authenticate User"]
    end
    
    subgraph P2_Data_Ingestion
        MQTT_SUB["MQTT Subscriber"]
        API_REC["API Receiver"]
        PAYLOAD_VAL["Payload Validator"]
    end
    
    subgraph P3_Processing
        LEVEL_CALC["Level Calculator"]
        AUTO_LOGIC["Automation Logic"]
        MOTOR_DEC["Motor Decision"]
    end
    
    subgraph P4_Storage
        TANK_UPDATE["Update Tank"]
        LOG_WRITE["Write Log"]
        CONFIG_SYNC["Sync Config"]
    end
    
    subgraph P5_Data_Output
        MQTT_PUB["MQTT Publisher"]
        API_RESP["API Response"]
        DASHBOARD["Dashboard Data"]
    end
    
    subgraph Stores
        USERS[("Users")]
        TANKS[("Tanks")]
        LOGS[("Logs")]
        CONFIGS[("Configs")]
    end
    
    ESP_S -->|MQTT: level| MQTT_SUB
    MQTT_SUB --> PAYLOAD_VAL
    USER -->|HTTP: Request| AUTH_ENT
    AUTH_ENT --> P2_Data_Ingestion
    PAYLOAD_VAL --> LEVEL_CALC
    LEVEL_CALC --> AUTO_LOGIC
    AUTO_LOGIC --> MOTOR_DEC
    MOTOR_DEC --> CONFIG_SYNC
    CONFIG_SYNC --> TANKS
    TANKS --> LOG_WRITE
    LOG_WRITE --> LOGS
    MOTOR_DEC -->|Command| MQTT_PUB
    MQTT_PUB -->|MQTT: motor| ESP_R
    USER -->|GET/PUT| API_RESP
    API_RESP --> TANKS
    API_RESP --> DASHBOARD
    
    style P1_Auth fill:#f9f,stroke:#333
    style P2_Data_Ingestion fill:#bbf,stroke:#333
    style P3_Processing fill:#dfd,stroke:#333
    style P4_Storage fill:#ffd,stroke:#333
    style P5_Data_Output fill:#dff,stroke:#333
```

---

## 5. Sequence Diagrams

### 5.1 Sensor Data Flow
```mermaid
sequenceDiagram
    participant Sensor as ESP32 Sensor
    participant Broker as MQTT Broker
    participant Backend as Node.js API
    participant DB as MongoDB
    participant Relay as ESP32 Relay
    participant UI as React Dashboard
    
    Sensor->>Sensor: Measure Distance (HC-SR04)
    Sensor->>Broker: Publish level data
    Broker->>Backend: Deliver MQTT message
    Backend->>Backend: Validate Payload
    Backend->>Backend: Calculate Level %
    Backend->>Backend: Check Automation Rules
    
        alt Automation Enabled
            alt Level < 20%
                Backend->>Backend: Set Motor ON
            else Level > 95%
                Backend->>Backend: Set Motor OFF
        end
    end
    
    Backend->>DB: Update Tank State
    Backend->>DB: Create Log Entry
    Backend->>Broker: Publish Motor Command
    Broker->>Relay: Deliver Command
    Relay->>Relay: Toggle GPIO Pin
    
    Backend-->>UI: HTTP Response (polled)
    UI->>UI: Update Tank Display
    
    Note over Sensor,Relay: ESP-NOW also sends direct signal to Relay (offline path)
```

### 5.2 User Login Flow
```mermaid
sequenceDiagram
    participant User as User Browser
    participant Frontend as React App
    participant Backend as Express API
    participant DB as MongoDB
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>Backend: Validate input
    Backend->>DB: Find user by email
    DB-->>Backend: User document
    Backend->>Backend: Verify password (bcrypt)
    alt Credentials valid
        Backend->>Backend: Generate JWT token
        Backend-->>Frontend: { token, user }
        Frontend->>Frontend: Store in localStorage
        Frontend->>Frontend: Redirect to Dashboard
    else Invalid credentials
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Show error message
    end
```

### 5.3 Motor Control Flow
```mermaid
sequenceDiagram
    participant User as User Dashboard
    participant Frontend as React App
    participant Backend as Express API
    participant Broker as MQTT Broker
    participant Relay as ESP32 Relay
    participant Motor as Water Pump
    
    User->>Frontend: Click Motor Toggle
    Frontend->>Backend: POST /api/tank/motor
    Backend->>Backend: Validate request
    Backend->>Backend: Update motorStatus in DB
    Backend->>Broker: Publish motor command
    Broker->>Relay: Deliver MQTT message
    Relay->>Relay: Parse command
    Relay->>Motor: Set GPIO HIGH/LOW
    Motor->>Motor: Pump ON/OFF
    Backend-->>Frontend: Updated tank state
    Frontend->>Frontend: Update UI
```

---

## 6. System State Diagram (Motor States)

```mermaid
stateDiagram-v2
    [*] --> Idle : System Init
    
    state Idle {
        [*] --> MotorOFF
        MotorOFF --> MotorOFF : Manual OFF
    }
    
    state Filling {
        [*] --> MotorON
        MotorON --> MotorON : Filling continues
    }
    
    Idle --> Filling : Level < emptyThreshold AND automationEnabled
    Idle --> Filling : User Manual Override ON
    Filling --> Idle : Level >= fullThreshold AND automationEnabled
    Filling --> Idle : User Manual Override OFF
    Filling --> Idle : Safety timeout reached
    
    state Filling {
        state "Checking Level" as CL
        MotorON --> CL : Every reading interval
        CL --> MotorON : Level < fullThreshold : Continue
        CL --> [*] : Level >= fullThreshold : Stop
    }
    
    state Idle {
        state "Monitoring" as M
        MotorOFF --> M : Every reading interval
        M --> MotorOFF : Level > emptyThreshold : Wait
        M --> [*] : Level <= emptyThreshold : Start filling
    }
    
    note right of Filling: Hysteresis: OFF at 95%\nON at 20%
    note left of Idle: Safety: Motor OFF if no level\nchange detected for 30 min
```

---

## 7. Component Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer
        subgraph Web["Web Dashboard"]
            DASH["React Dashboard"]
            CHARTS["Recharts Analytics"]
            STATE["React Context"]
        end
        subgraph Mobile["Mobile App (Future)"]
            NATIVE["React Native"]
            PUSH["Push Notifications"]
        end
    end
    
    subgraph Network_Layer
        HTTP["REST API / HTTPS"]
        WS["WebSocket (Future)"]
        MQTT["MQTT Broker"]
    end
    
    subgraph Server_Layer
        subgraph Express["Express.js Backend"]
            AUTH["Auth Middleware"]
            ROUTES["API Routes"]
            VALIDATORS["Input Validation"]
            RATE_LIMIT["Rate Limiter"]
        end
        
        subgraph Services["Business Logic"]
            TANK_SVC["Tank Service"]
            ANALYTICS["Analytics Service"]
            NOTIFY["Notification Service"]
            MQTT_SVC["MQTT Service"]
        end
    end
    
    subgraph Data_Layer
        MONGO["MongoDB Atlas"]
        CACHE["Redis Cache (Future)"]
    end
    
    subgraph IoT_Layer
        subgraph ESP32_Sensor["Sensor Node"]
            SENSOR["HC-SR04"]
            ESP_S["ESP32 Sensor"]
            ESPNOW_S["ESP-NOW TX"]
            MQTT_S["MQTT Client"]
        end
        
        subgraph ESP32_Relay["Relay Node"]
            ESP_R["ESP32 Relay"]
            ESPNOW_R["ESP-NOW RX"]
            MQTT_R["MQTT Client"]
            GPIO["GPIO 4"]
            RELAY_COIL["Relay Module"]
            MOTOR["Water Pump"]
        end
    end
    
    DASH --> HTTP
    DASH --> WS
    HTTP --> AUTH
    WS --> AUTH
    AUTH --> ROUTES
    ROUTES --> VALIDATORS
    VALIDATORS --> TANK_SVC
    VALIDATORS --> ANALYTICS
    TANK_SVC --> MQTT_SVC
    TANK_SVC --> NOTIFY
    ANALYTICS --> MONGO
    TANK_SVC --> MONGO
    MQTT_SVC --> MQTT
    MQTT --> MQTT_S
    MQTT --> MQTT_R
    ESPNOW_S -.-> ESPNOW_R
    MQTT_S --> SENSOR
    MQTT_R --> GPIO
    GPIO --> RELAY_COIL
    RELAY_COIL --> MOTOR
    NOTIFY --> PUSH
    
    style Client_Layer fill:#e1f5fe
    style Server_Layer fill:#fff3e0
    style Data_Layer fill:#e8f5e9
    style IoT_Layer fill:#fce4ec
    style Network_Layer fill:#f3e5f5
```

---

## 8. Deployment Architecture

```mermaid
flowchart LR
    subgraph Cloud["Cloud Infrastructure"]
        subgraph CDN["CDN / Edge"]
            VERCEL["Vercel Frontend\nCDN Distributed"]
        end
        
        subgraph Compute["Compute"]
            RENDER["Render Backend\nAuto-scaling"]
        end
        
        subgraph Database["Data"]
            MONGODB["MongoDB Atlas\nM0 Cluster"]
        end
        
        subgraph Messaging["Messaging"]
            HIVEMQ["HiveMQ Cloud\nMQTT Broker"]
        end
        
        subgraph Services["External Services"]
            EMAIL["Email Service\n(SendGrid/Resend)"]
            SMS["SMS Service\n(Twilio)"]
        end
    end
    
    subgraph Hardware["Hardware"]
        ESP32["ESP32 Dev Kit"]
        SENSOR["HC-SR04"]
        RELAY["5V Relay"]
        MOTOR["Water Pump"]
    end
    
    subgraph Users["Users"]
        WEB["Web Browser"]
        MOBILE["Mobile App"]
    end
    
    WEB --> VERCEL
    MOBILE --> VERCEL
    VERCEL --> RENDER
    RENDER --> MONGODB
    RENDER --> HIVEMQ
    RENDER --> EMAIL
    ESP32 --> HIVEMQ
    ESP32 --> SENSOR
    RENDER --> SMS
    
    style Cloud fill:#f5f5f5,stroke:#333
    style Hardware fill:#ffebee,stroke:#333
    style Users fill:#e8f5e9,stroke:#333
```

---

## 9. Security Architecture

```mermaid
flowchart TB
    subgraph Threats["Security Threats"]
        SQLI["SQL/NoSQL Injection"]
        XSS["XSS Attacks"]
        CSRF["CSRF"]
        BRUTE["Brute Force"]
        MITM["Man-in-the-Middle"]
        DOS["DoS/DDoS"]
        IOT_HACK["IoT Device Hijacking"]
    end
    
    subgraph Defenses["Security Measures"]
        subgraph Transport["Transport Security"]
            TLS["TLS 1.3"]
            HTTPS["HTTPS Only"]
            HSTS["HSTS Header"]
        end
        
        subgraph Auth["Authentication"]
            JWT["JWT Tokens"]
            BCRYPT["bcrypt Hashing"]
            API_KEY["API Key Rotation"]
            MFA["2FA (Future)"]
        end
        
        subgraph Validation["Input Validation"]
            SANITIZE["Input Sanitization"]
            SCHEMA["JSON Schema"]
            ZOD["Zod Validation"]
        end
        
        subgraph Rate["Rate Limiting"]
            LIMITER["express-rate-limit"]
            THROTTLE["API Throttling"]
        end
        
        subgraph Monitoring["Monitoring"]
            LOGGING["Morgan Logging"]
            ALERT["Security Alerts"]
        end
    end
    
    Threats --> Defenses
    
    style Threats fill:#ffcdd2
    style Defenses fill:#c8e6c9
```
