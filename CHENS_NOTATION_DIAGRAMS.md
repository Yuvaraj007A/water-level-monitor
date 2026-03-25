# Water Level Monitor - Chen's Notation Diagrams

## 1. ER Diagram (Chen’s Notation)

### Entity Sets

```
┌─────────────────┐
│     USER        │
├─────────────────┤
│ _id (PK)        │
│ name            │
│ email           │
│ password_hash   │
│ role            │
│ notifications   │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     TANK         │
├─────────────────┤
│ _id (PK)         │
│ user_id (FK)     │
│ tank_height      │
│ capacity_liters   │
│ current_level     │
│ water_volume      │
│ motor_status      │
│ automation_en     │
│ low_threshold     │
│ high_threshold    │
│ last_updated      │
└─────────────────┘

┌─────────────────┐
│   USER_SETTINGS │
├─────────────────┤
│ _id (PK)         │
│ user_id (FK)     │
│ theme            │
│ refresh_interval │
│ notify_level     │
└─────────────────┘

┌─────────────────┐
│   TANK_CONFIG   │
├─────────────────┤
│ _id (PK)         │
│ tank_id (FK)     │
│ esp32_mac        │
│ api_key          │
│ reading_interval │
│ hysteresis       │
└─────────────────┘

┌─────────────────┐
│      LOG         │
├─────────────────┤
│ _id (PK)         │
│ tank_id (FK)     │
│ level            │
│ distance         │
│ water_volume     │
│ motor_status     │
│ trigger          │
│ timestamp        │
└─────────────────┘

┌─────────────────┐
│ MOTOR_COMMAND   │
├─────────────────┤
│ _id (PK)         │
│ tank_id (FK)     │
│ command          │
│ source           │
│ timestamp        │
└─────────────────┘
```

### Relationships

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Chen's Relationship Notation                           │
└──────────────────────────────────────────────────────────────────────────────┘

                    1                   N
┌─────────┐ ─────────────── ───────────────► │─────────│
│  USER   │         owns                   │  TANK   │
└─────────┘ ◄────────────── ──────────────── └─────────┘
   (0,1)                  1                     (1,1)

Reading: Each USER owns (0,N) TANKs. Each TANK is owned by exactly 1 USER.


                    1                   N
┌─────────┐ ─────────────── ───────────────► │─────────│
│  USER   │       has_settings            │SETTINGS│
└─────────┘ ◄────────────── ──────────────── └─────────┘
   (1,1)                  1                     (1,1)

Reading: Each USER has exactly 1 SETTINGS. Each SETTINGS belongs to exactly 1 USER.


                    1                   N
┌─────────┐ ─────────────── ───────────────► │─────────│
│  TANK   │       has_config              │CONFIG  │
└─────────┘ ◄────────────── ──────────────── └─────────┘
   (1,1)                  1                     (1,1)

Reading: Each TANK has exactly 1 CONFIG. Each CONFIG belongs to exactly 1 TANK.


                    1                   N
┌─────────┐ ─────────────── ───────────────► │─────────│
│  TANK   │       generates                │  LOG   │
└─────────┘ ◄────────────── ──────────────── └─────────┘
   (1,1)                  1                 (1,N)

Reading: Each TANK generates (1,N) LOGs. Each LOG belongs to exactly 1 TANK.


                    1                   N
┌─────────┐ ─────────────── ───────────────► │──────│
│  TANK   │       receives                │MOTOR │
└─────────┘ ◄────────────── ──────────────── └──────┘
   (1,1)                  1                  (1,N)

Reading: Each TANK receives (1,N) MOTOR_COMMANDs. Each MOTOR_COMMAND belongs to exactly 1 TANK.
```

### Full Chen's ER Diagram

```
                                    N
┌──────────┐    ┌───────────┐ ◄──────────► ┌──────────┐
│   USER   │────│   OWNS    │────────────── │   TANK   │
└──────────┘    └───────────┘              └──────────┘
     │                                        │
     │ 1                                     │ 1
     │                                        │
     │                                    N   │
     │ ┌───────────┐ ◄──────────┐            │
     └│  HAS      │─────────────│ TANK_CONFIG
       └───────────┘             └──────────────┘
     │ 1
     │
     │ ┌───────────┐ ◄──────────┐
     └│  HAS      │─────────────│ USER_SETTINGS
       └───────────┘             └──────────────┘

                                    N
       ┌───────────┐ ◄──────────┐   │
  ┌──────────┐────│  GENERATES  │───┘
  │   TANK   │────│             │───────► ┌──────────┐
  └──────────┘    └───────────┘         │   LOG    │
       │                                  └──────────┘
       │
       │ N
       ┌───────────┐ ◄──────────┐
       │ RECEIVES   │─────────────│ ┌──────────┐
       └───────────┘             └►│  MOTOR   │
                                   └──────────┘
```

---

## 2. UML Class Diagram (Chen’s-inspired with Classes)

### Class Structure with Attributes and Methods

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                  │
├─────────────────────────────────────────────────────────────────┤
│ Attributes:                                                      │
│   - _id: ObjectId (PK)                                         │
│   - name: String                                                │
│   - email: String (UK)                                          │
│   - passwordHash: String                                        │
│   - role: String ["user", "admin"]                              │
│   - emailNotifications: Boolean                                 │
│   - pushNotifications: Boolean                                  │
│   - createdAt: Date                                            │
│   - lastLogin: Date                                             │
├─────────────────────────────────────────────────────────────────┤
│ Methods:                                                         │
│   + register(name, email, password): Promise~User~              │
│   + login(email, password): Promise~{user, token}~               │
│   + generateAuthToken(): String                                 │
│   + comparePassword(enteredPassword): Boolean                    │
│   + updateProfile(data): Promise~User~                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                            TANK                                  │
├─────────────────────────────────────────────────────────────────┤
│ Attributes:                                                      │
│   - _id: ObjectId (PK)                                          │
│   - userId: ObjectId (FK → USER)                                │
│   - tankHeight: Number (cm)                                      │
│   - tankCapacityLiters: Number                                  │
│   - currentLevel: Number (%)                                     │
│   - waterVolume: Number (L)                                      │
│   - motorStatus: String ["ON", "OFF"]                            │
│   - automationEnabled: Boolean                                   │
│   - lowThreshold: Number (%)                                     │
│   - highThreshold: Number (%)                                    │
│   - lastUpdated: Date                                           │
├─────────────────────────────────────────────────────────────────┤
│ Methods:                                                         │
│   + updateLevel(distance): Promise~Tank~                        │
│   + calculateLevel(): Number                                    │
│   + toggleMotor(status): Promise~Tank~                          │
│   + checkAutomation(): void                                     │
│   + getHistory(start, end): Promise~Array~Log~                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         TANK_CONFIG                              │
├─────────────────────────────────────────────────────────────────┤
│ Attributes:                                                      │
│   - _id: ObjectId (PK)                                          │
│   - tankId: ObjectId (FK → TANK)                                 │
│   - esp32MacAddress: String                                      │
│   - apiKey: String                                               │
│   - readingInterval: Number (seconds)                             │
│   - hysteresisOffset: Number (%)                                 │
├─────────────────────────────────────────────────────────────────┤
│ Methods:                                                         │
│   + updateSettings(config): Promise~TankConfig~                │
│   + regenerateApiKey(): String                                  │
│   + validateMac(): Boolean                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                             LOG                                  │
├─────────────────────────────────────────────────────────────────┤
│ Attributes:                                                      │
│   - _id: ObjectId (PK)                                          │
│   - tankId: ObjectId (FK → TANK)                                │
│   - level: Number (%)                                            │
│   - distance: Number (cm)                                        │
│   - waterVolume: Number (L)                                     │
│   - motorStatus: String ["ON", "OFF"]                            │
│   - trigger: String ["auto", "manual", "esp32"]                 │
│   - timestamp: Date                                             │
├─────────────────────────────────────────────────────────────────┤
│ Methods:                                                         │
│   + static create(data): Promise~Log~                           │
│   + static findByTankId(tankId): Promise~Array~                 │
│   + static findByDateRange(start, end): Promise~Array~          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       MOTOR_COMMAND                              │
├─────────────────────────────────────────────────────────────────┤
│ Attributes:                                                      │
│   - _id: ObjectId (PK)                                          │
│   - tankId: ObjectId (FK → TANK)                                │
│   - command: String ["ON", "OFF"]                                │
│   - source: String ["cloud", "local", "api"]                     │
│   - timestamp: Date                                             │
├─────────────────────────────────────────────────────────────────┤
│ Methods:                                                         │
│   + static create(data): Promise~MotorCommand~                 │
│   + static getLatest(tankId): Promise~MotorCommand~             │
└─────────────────────────────────────────────────────────────────┘
```

### Class Relationships

```
┌──────────┐                    ┌──────────┐
│   USER   │1──────────────N────│   TANK   │
└──────────┘      owns          └──────────┘
     │                                  │
     │1                                 │1
     │                                  │
     │              ┌──────────────┐   │
     └─────────────►│USER_SETTINGS │   │
                    └──────────────┘   │
                                        │1
                                        │
                    ┌──────────────┐   │
                    │ TANK_CONFIG   │◄──┘
                    └──────────────┘

┌──────────┐                    ┌──────────┐
│   TANK   │1──────────────N────│   LOG    │
└──────────┘     generates      └──────────┘

┌──────────┐                    ┌──────────┐
│   TANK   │1──────────────N────│  MOTOR   │
└──────────┘      receives      └──────────┘
```

---

## 3. DFD (Data Flow Diagram) - Chen's Style

### Level 0: Context Diagram

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    │     WATER LEVEL MONITOR SYSTEM           │
                    │                                         │
                    │   ┌─────────────────────────────────┐   │
                    │   │                                 │   │
                    │   │                                 │   │
                    │   │                                 │   │
                    │   │                                 │   │
                    │   └─────────────────────────────────┘   │
                    │                                         │
                    └─────────────────────────────────────────┘

External Entities:                              External Entities:
     │                                                ▲
     │                                                │
     ▼                                                │
┌─────────────────┐                      ┌─────────────────┐
│  ESP32 SENSOR   │ ──────────────────► │  ESP32 RELAY    │
│  HC-SR04        │                      │  Motor Control  │
└─────────────────┘                      └─────────────────┘
     │
     │
     ▼
┌─────────────────┐
│     USER        │
│   Dashboard     │
└─────────────────┘
```

### Level 1: Data Flow Diagram with Processes

```
                              ┌─────────────────┐
                              │  P1: AUTHENTICATE│
┌──────────────┐              │                 │
│    USER      │─────────────►│ - Validate cred │
└──────────────┘   Login Req   │ - Generate JWT  │
         │         ◄──────────│ - Check perms    │
         │         Token       └─────────────────┘
         │                          │
         │                          │ Valid User
         │                          ▼
         │              ┌─────────────────┐
         │              │ P2: DATA INGEST │
         │              │                 │
         │              │ - Parse MQTT    │
         │─────────────►│ - Validate JSON│
         │   HTTP Req   │ - Check API key│
         │              └────────┬────────┘
         │                       │
         │                       │ Raw Data
         │                       ▼
         │              ┌─────────────────┐
         │              │ P3: PROCESS     │
         │              │                 │
         │              │ - Calc level % │
         │─────────────►│ - Apply rules  │
         │   Tank Update │ - Motor logic  │
         │              └────────┬────────┘
         │                       │
         │                       │ Processed Data
         │                       ▼
         │              ┌─────────────────┐
         │              │ P4: STORAGE     │
         │              │                 │
         │─────────────►│ - Update Tank  │
         │  Read/Write  │ - Write Log    │
         │              └────────┬────────┘
         │                       │
         │                       │ Saved Data
         │                       ▼
         │              ┌─────────────────┐
         │              │ P5: OUTPUT      │
         │              │                 │
         │─────────────►│ - MQTT Publish │
         │  Dashboard   │ - API Response │
         │              │ - Push Notif   │
         │              └────────┬────────┘
         │                       │
         │         ┌─────────────┴───────────┐
         │         │                         │
         ▼         ▼                         ▼
┌─────────────┐ ┌─────────────┐       ┌─────────────┐
│ ESP32 RELAY │ │ MQTT BROKER │       │   USER UI   │
└─────────────┘ └─────────────┘       └─────────────┘

                    Data Stores:
                    ┌─────────────┐
                    │   USERS     │
                    │   TANKS     │
                    │   LOGS      │
                    │   CONFIGS   │
                    └─────────────┘
```

### DFD Process Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│ PROCESS P1: AUTHENTICATE                                         │
├─────────────────────────────────────────────────────────────────┤
│ Process Number: 1                                               │
│ Process Name: User Authentication                               │
│                                                                 │
│ Input Flows:                                                    │
│   - Login credentials (email, password)                         │
│                                                                 │
│ Output Flows:                                                   │
│   - JWT token (on success)                                      │
│   - Error message (on failure)                                  │
│                                                                 │
│ Function:                                                       │
│   1. Receive email and password                                 │
│   2. Query USERS store for matching email                       │
│   3. Compare hashed password using bcrypt                      │
│   4. If valid, generate JWT with user ID and role              │
│   5. Return token; otherwise return error                        │
│                                                                 │
│ Constraints:                                                    │
│   - Rate limit: 5 attempts per minute per IP                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROCESS P3: DATA PROCESSING                                      │
├─────────────────────────────────────────────────────────────────┤
│ Process Number: 3                                               │
│ Process Name: Level Calculation & Automation                    │
│                                                                 │
│ Input Flows:                                                    │
│   - Raw sensor data (distance in cm)                            │
│   - Tank configuration (height, thresholds)                     │
│                                                                 │
│ Output Flows:                                                   │
│   - Calculated level percentage                                 │
│   - Motor command (ON/OFF)                                      │
│                                                                 │
│ Function:                                                       │
│   Level % = ((tankHeight - distance) / tankHeight) × 100        │
│                                                                 │
│   Automation Rules:                                             │
│   IF automationEnabled = TRUE THEN                              │
│     IF level <= lowThreshold (20%) THEN motorStatus = ON       │
│     IF level >= highThreshold (90%) THEN motorStatus = OFF     │
│                                                                 │
│   Water Volume = (level / 100) × capacityLiters                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Enhanced ER with Attributes Shown

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐     │
│  │    _id      │  │    name    │  │   email    │  │ password_hash │     │
│  │  (Primary   │  │            │  │            │  │               │     │
│  │    Key)     │  │            │  │  (Unique)  │  │               │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────┘     │
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐     │
│  │    role    │  │  notif_en  │  │ created_at │  │  last_login   │     │
│  │            │  │            │  │            │  │               │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER_SETTINGS                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐     │
│  │    _id      │  │   theme    │  │  refresh   │  │  notify_level  │     │
│  │  (Primary   │  │            │  │  interval  │  │               │     │
│  │    Key)     │  │            │  │            │  │               │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────┘     │
│                                                                         │
│  ┌────────────────┐                                                      │
│  │    user_id     │                                                      │
│  │  (Foreign Key) │                                                      │
│  └────────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              TANK                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐     │
│  │    _id      │  │ tank_height│  │  capacity  │  │ current_level │     │
│  │  (Primary   │  │    (cm)    │  │  (liters)  │  │     (%)       │     │
│  │    Key)     │  │            │  │            │  │               │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────┘     │
│                                                                         │
│  ┌────────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │ water_volume   │  │motor_status│  │ auto_en    │  │ low_threshold  │ │
│  │    (L)         │  │  ON/OFF    │  │            │  │     (%)       │ │
│  └────────────────┘  └────────────┘  └────────────┘  └────────────────┘ │
│                                                                         │
│  ┌────────────────┐  ┌────────────┐  ┌────────────────┐                  │
│  │ high_threshold │  │ last_upd   │  │    user_id     │                  │
│  │     (%)        │  │            │  │  (Foreign Key) │                  │
│  └────────────────┘  └────────────┘  └────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │ 1:1                          │ 1:N
                    │                              │
                    ▼                              ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│         TANK_CONFIG             │    │            LOG                  │
│  ┌────────────┐  ┌───────────┐ │    │  ┌────────────┐  ┌───────────┐ │
│  │    _id      │  │ esp32_mac │ │    │  │    _id      │  │   level   │ │
│  │  (Primary   │  │           │ │    │  │  (Primary   │  │   (%)     │ │
│  │    Key)     │  └───────────┘ │    │  │    Key)     │  └───────────┘ │
│  └────────────┘                 │    │  └────────────┘                │
│  ┌────────────┐  ┌───────────┐ │    │  ┌────────────┐  ┌───────────┐ │
│  │   api_key  │  │ interval  │ │    │  │  distance  │  │ water_vol │ │
│  │            │  │  (sec)    │ │    │  │    (cm)     │  │   (L)     │ │
│  └────────────┘  └───────────┘ │    │  └────────────┘  └───────────┘ │
│  ┌────────────────────────────┐ │    │  ┌────────────┐  ┌───────────┐ │
│  │        tank_id              │ │    │  │motor_status│  │  trigger  │ │
│  │       (Foreign Key)          │ │    │  │   ON/OFF   │  │           │ │
│  └────────────────────────────┘ │    │  └────────────┘  └───────────┘ │
└─────────────────────────────────┘    │  ┌────────────────────────────┐  │
                                      │  │         tank_id             │  │
                                      │  │        (Foreign Key)        │  │
                                      │  └────────────────────────────┘  │
                                      └──────────────────────────────────┘
                                                       │
                                                       │ 1:N
                                                       │
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │        MOTOR_COMMAND            │
                                      │  ┌────────────┐  ┌───────────┐ │
                                      │  │    _id      │  │  command  │ │
                                      │  │  (Primary   │  │  ON/OFF   │ │
                                      │  │    Key)     │  └───────────┘ │
                                      │  └────────────┘                │
                                      │  ┌────────────┐  ┌───────────┐ │
                                      │  │   source   │  │ timestamp │ │
                                      │  │ cloud/api  │  │           │ │
                                      │  └────────────┘  └───────────┘ │
                                      │  ┌────────────────────────────┐│
                                      │  │         tank_id             ││
                                      │  │        (Foreign Key)        ││
                                      │  └────────────────────────────┘│
                                      └─────────────────────────────────┘
```

---

## 5. Complete Chen's ER with All Relationships

```
                              1:N
┌──────────┐    ┌───────────┐ ◄──────► ┌──────────┐    1:1
│   USER   │────│   OWNS    │────────── │   TANK   │────│──────────┐
└──────────┘    └───────────┘          └──────────┘    │TANK_CONFIG│
     │                                       │          └──────────┘
     │                                       │
     │1                                      │1
     │                                       │
     │    ┌───────────┐                      │    1:N
     └────│  HAS      │                      └────│GENERATES│────► ┌──────┐
         └───────────┘                             └─────────┘       │  LOG  │
             │1                                           │          └──────┘
             │                                           │N
             │
             │    ┌───────────┐
             └────│  HAS      │
                 └───────────┘
                     │1
                     │
              ┌──────────────┐
              │USER_SETTINGS │
              └──────────────┘

                                      1:N
         ┌──────────┐    ┌───────────┐ ◄──────► ┌──────────┐
         │   TANK   │────│  RECEIVES  │────────── │  MOTOR   │
         └──────────┘    └───────────┘          └──────────┘


RELATIONSHIP DEFINITIONS (Chen's Notation):

┌────────────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP: OWNS                                                     │
├────────────────────────────────────────────────────────────────────────┤
│   Entity 1: USER (1)                                                    │
│   Entity 2: TANK (N)                                                    │
│   Cardinality: (1,N)                                                    │
│   Participation: Total (USER) - Partial (TANK)                         │
│   Attributes: owned_since (date)                                        │
│   Semantic: A USER owns one or more TANKs for monitoring.               │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP: GENERATES                                                │
├────────────────────────────────────────────────────────────────────────┤
│   Entity 1: TANK (1)                                                    │
│   Entity 2: LOG (N)                                                     │
│   Cardinality: (1,N)                                                    │
│   Participation: Total (both)                                           │
│   Attributes: generated_at (timestamp)                                  │
│   Semantic: Each TANK generates multiple LOG entries for history.       │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP: RECEIVES                                                  │
├────────────────────────────────────────────────────────────────────────┤
│   Entity 1: TANK (1)                                                    │
│   Entity 2: MOTOR_COMMAND (N)                                           │
│   Cardinality: (1,N)                                                    │
│   Participation: Total (TANK) - Partial (MOTOR_COMMAND)                 │
│   Attributes: received_at (timestamp), acknowledged (boolean)          │
│   Semantic: A TANK receives motor commands from cloud or local ESP32.   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP: HAS                                                       │
├────────────────────────────────────────────────────────────────────────┤
│   Entity 1: USER (1)                                                    │
│   Entity 2: USER_SETTINGS (1)                                          │
│   Cardinality: (1,1)                                                    │
│   Participation: Total (both)                                          │
│   Attributes: none (pure relationship)                                 │
│   Semantic: Each USER has exactly one USER_SETTINGS record.              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ RELATIONSHIP: HAS (TANK_CONFIG)                                         │
├────────────────────────────────────────────────────────────────────────┤
│   Entity 1: TANK (1)                                                    │
│   Entity 2: TANK_CONFIG (1)                                            │
│   Cardinality: (1,1)                                                    │
│   Participation: Total (both)                                          │
│   Attributes: configured_at (timestamp)                                 │
│   Semantic: Each TANK has exactly one TANK_CONFIG for hardware linking. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Weak Entity Sets

```
STRONG ENTITY: TANK
┌─────────────────────────────────┐
│         TANK                    │
│  ┌───────────────────────────┐ │
│  │ _id (Primary Key)         │ │
│  │ user_id (Foreign Key)     │ │
│  │ tank_height               │ │
│  │ tank_capacity_liters      │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
              │
              │ 1:N
              │ Identified by
              ▼
WEAK ENTITY: LOG (depends on TANK)
┌─────────────────────────────────┐
│         LOG                     │
│  ┌───────────────────────────┐ │
│  │ _id (Partial Key)         │ │ ← Dashed border (weak)
│  │ tank_id (Foreign Key)     │ │
│  │ timestamp (Partial Key)   │ │
│  │ level                     │ │
│  │ motor_status              │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘

Weak Entity Identification:
  - LOG is identified by the combination of:
    1. Its own _id
    2. The primary key of TANK (via tank_id)
    3. The timestamp

  Full identifier: (tank_id, timestamp, _id)
```

---

## 7. ISA (Inheritance) Hierarchies

```
ISA HIERARCHY FOR USER TYPES:

                          ┌──────────┐
                          │   USER   │  (Supertype)
                          └──────────┘
                               △
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              │                │                │
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │  ADMIN   │    │  USER    │    │   ESP    │  (Device)
         └──────────┘    └──────────┘    └──────────┘
         (Subtypes)       (Subtypes)    (Subtypes)

Covering Constraint: YES (every entity is one of the subtypes)
Disjoint Constraint: YES (a USER cannot be both ADMIN and ESP)

Shared Attributes (in USER):
  - _id
  - email
  - password_hash
  - created_at

Specific Attributes:
  ADMIN: permissions[], access_level
  USER: name, phone, notifications_prefs
  ESP:  mac_address, api_key, tank_id (FK)


ISA HIERARCHY FOR TANK TYPES:

                          ┌──────────┐
                          │   TANK   │  (Supertype)
                          └──────────┘
                               △
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
    ┌──────────┐                              ┌──────────┐
    │ OVERHEAD │                              │ GROUND   │
    │   TANK   │                              │ RESERVOIR│
    └──────────┘                              └──────────┘

Specific Attributes:
  OVERHEAD: roof_material, support_structure, overflow_height
  GROUND: latitude, longitude, excavation_depth
```

---

## 8. Aggregation

```
AGGREGATION FOR MOTOR CONTROL MONITORING:

Normal Relationship:
  TANK ────receives────► MOTOR_COMMAND

With Aggregation (treat as higher-level entity):

┌─────────────────────────────────────────────────────────────────┐
│                        MONITORED_CONTROL                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    AGGREGATION BOX                          │ │
│  │                                                              │ │
│  │     ┌──────────┐           ┌──────────────┐                 │ │
│  │     │   TANK   │──receives──►│MOTOR_COMMAND │                 │ │
│  │     └──────────┘           └──────────────┘                 │ │
│  │                                                              │ │
│  │     Attributes of aggregation:                               │ │
│  │     - monitored_since                                       │ │
│  │     - total_commands_sent                                    │ │
│  │     - last_command_status                                    │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N
                          ▼
                    ┌──────────┐
                    │ ANALYTICS│
                    └──────────┘

Semantic: The (TANK, MOTOR_COMMAND) relationship itself is being 
          tracked by the ANALYTICS entity.
```

---

## 9. Summary Table of All Entities and Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY SUMMARY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENTITY        │ TYPE    │ PRIMARY KEY │ DERIVED ATTRS   │ TOTAL │ COMPLEX   │
├───────────────┼─────────┼─────────────┼─────────────────┼───────┼──────────┤
│ USER           │ Strong  │ _id         │ none             │ Y     │ N        │
│ TANK           │ Strong  │ _id         │ current_level,   │ N     │ N        │
│                │         │             │ water_volume      │       │          │
│ LOG            │ Weak    │ _id,        │ none             │ Y     │ N        │
│                │         │ tank_id,    │                  │       │          │
│                │         │ timestamp   │                  │       │          │
│ USER_SETTINGS  │ Strong  │ _id         │ none             │ Y     │ N        │
│ TANK_CONFIG    │ Strong  │ _id         │ none             │ Y     │ N        │
│ MOTOR_COMMAND  │ Strong  │ _id         │ none             │ N     │ N        │
└───────────────┴─────────┴─────────────┴─────────────────┴───────┴──────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         RELATIONSHIP SUMMARY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ RELATIONSHIP    │ ENTITY 1  │ CARD  │ ENTITY 2  │ CARD │ ATTRIBUTES        │
├──────────────────┼──────────┼───────┼──────────┼──────┼───────────────────┤
│ OWNS             │ USER     │ 1     │ TANK     │ N    │ owned_since        │
│ HAS (Settings)   │ USER     │ 1     │ U.SETTNGS│ 1    │ none               │
│ HAS (Config)     │ TANK     │ 1     │ T.CONFIG │ 1    │ configured_at      │
│ GENERATES        │ TANK     │ 1     │ LOG      │ N    │ none               │
│ RECEIVES         │ TANK     │ 1     │ MOTOR    │ N    │ received_at        │
└──────────────────┴──────────┴───────┴──────────┴──────┴───────────────────┘

CARD Legend: 1 = exactly one, N = one or many, (0,N) = optional to many

┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRITY CONSTRAINTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONSTRAINT TYPE            │ DESCRIPTION                                  │
├────────────────────────────┼──────────────────────────────────────────────┤
│ Key Constraint              │ Each entity has unique identifier (_id)      │
│ Participation Constraint    │ USER→TANK: Total (cascade delete)          │
│                             │ TANK→LOG: Total (orphan logs deleted)        │
│ Cardinality                 │ See relationship table above                │
│ Domain Constraints           │ motorStatus ∈ {ON, OFF}                     │
│                             │ level ∈ [0, 100]                             │
│                             │ role ∈ {user, admin, esp}                   │
│ Range Constraints           │ tankHeight > 0                               │
│                             │ emptyThreshold < fullThreshold              │
└────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 10. MiniMax-Style Chen's Diagrams

### Alternative Compact Chen's Notation

```
╔══════════════════════════════════════════════════════════════════════════╗
║                          CHEN'S NOTATION KEY                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌─────────┐          ┌─────────┐          ╱╲         ○                  ║
║  │ ENTITY  │──────────│RELATION │────────╱  ╲╲      ◯──────►           ║
║  │(Rect)   │          │(Diamond)│        1   N    Single/Multi-valued    ║
║  └─────────┘          └─────────┘                                               ║
║     │                        │               ┌───┐                           ║
║     │                        │               │ 1 │ Exactly One              ║
║     ▼                        ▼               ├───┤                           ║
║  ┌─────────┐          ┌─────────────┐         │ N │ Many                     ║
║  │ (PK)    │          │             │         ├───┤                           ║
║  │ (AK)    │          │             │         │(0,1)│ Zero or One            ║
║  │ (FK)    │          │             │         ├───┤                           ║
║  └─────────┘          └─────────────┘         │(0,N)│ Zero or Many           ║
║                                                  └───┘                       ║
║  ─────── (Dashed)  = Weak Entity / Partial Participation                  ║
║  ─────── (Solid)   = Strong Entity / Total Participation                  ║
╚══════════════════════════════════════════════════════════════════════════╝


COMPLETE ER DIAGRAM:

                              1
        ┌───────────┐    ┌────┴────┐    ┌───────────┐
        │   USER    │────│  OWNS   │────│   TANK    │
        └───────────┘    └─────────┘    └───────────┘
              │                               │
              │1                              │1
              │                               │
              │    ┌─────────┐                │
              └────│  HAS    │                │
                   └─────────┘                │1
                      │1                      │
                       │                      │
                       ▼                      ▼
                 ┌───────────┐         ┌───────────┐
                 │  USER_    │         │  TANK_    │
                 │  SETTINGS │         │  CONFIG   │
                 └───────────┘         └───────────┘
                                                │
                           1                    │
        ┌───────────┐    ┌────┴────┐            │
        │   LOG     │◄───│GENERATES│────────────┘
        └───────────┘    └─────────┘
              ▲
              │
              │N
        ┌─────┴─────┐
        │ REQUIRES  │◄──┐
        └───────────┘   │
                        │     1
              ┌─────────┴───┐    ┌───────────┐
              │    MOTOR     │────│  SOURCE   │
              └──────────────┘    └───────────┘
                      ▲
                      │
                      │N
              ┌───────┴────────┐
              │  RECEIVES       │
              └────────────────┘
                      ▲
                      │
                      │
                ┌─────┴──────┐
                │   TANK      │
                └────────────┘


LEGEND:
────── Solid line = Total participation
- - - - Dashed line = Partial participation
  1   = Exactly one
  N   = Many
```

This completes the Chen's notation diagrams for the Water Level Monitor system.
