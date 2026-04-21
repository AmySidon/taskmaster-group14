# System Sequence Diagram
This shows the communication flow between the React Frontend, Flask API, and Database.

```mermaid
sequenceDiagram
    autonumber
    participant Student as Student (React Frontend)
    participant API as Flask Backend (Port 5001)
    participant DB as PostgreSQL Database

    Student->>API: POST /api/tasks (JSON data)
    Note over API: Verify Authentication Token
    API->>DB: INSERT INTO tasks (title, course_id, priority)
    DB-->>API: 201 Created (Success)
    API-->>Student: Return Task Object
    Note over Student: UI Updates Task List
