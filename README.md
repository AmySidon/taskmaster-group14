# TaskMaster – Task Management System
CS 4398 Software Engineering Project

TaskMaster is a web-based task management application designed to help students organize assignments, track deadlines, and manage academic projects efficiently. The system allows users to create projects (courses), manage tasks, set priorities, and monitor progress in one centralized platform.

---

## Features

- User registration and authentication
- Create and manage projects (e.g., courses)
- Create, edit, and delete tasks
- Set task priorities (Low, Medium, High)
- Assign due dates and track deadlines
- Update task status (Pending, In Progress, Completed, Archived)
- Filter and search tasks
- Notifications and reminders (planned/optional)
- Activity tracking and session history (planned)

---

## Tech Stack

- **Frontend:** React (JavaScript)
- **Backend:** Python (Flask)
- **Database:** PostgreSQL
- **Communication:** REST API over HTTP/HTTPS

---

## Project Structure
taskmaster-group14/
│
├── frontend/ # React application (UI)
├── backend/ # Flask API and server logic
├── database/ # SQL schema and data setup
├── docs/ # diagrams, screenshots, testcases
├── tests/ # unit tests
│
├── README.md
└── .gitignore

---

## Setup Instructions

### 1. Clone the Repository

git clone https://github.com/AmySidon/taskmaster-group14.git
cd taskmaster-group14

---

### 2. Backend Setup (Flask)
    cd backend

    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    flask run --port=5001

    The backend should now be running at: 
    http://localhost:5001
    > **Note:** On macOS, port 5000 may already be in use (e.g., by AirPlay Receiver).  
>   If so, the backend is configured to run on port 5001.
---

### 3. Frontend Setup (React)
    cd frontend
    npm install
    npm run dev


    The frontend should now be running at:
    http://localhost:5173

---

## Acceptance Testcases (Examples)

- User registers a new account → account created successfully
- User logs in → redirected to dashboard
- User creates a task → task appears in list with default status
- User updates task status → changes reflected correctly
- User deletes task → task removed from system

---

## Diagrams and Documentation

Located in the `/docs` folder:

- UML Class Diagram
- Statechart Diagrams
- Acceptance Testcase Screenshots
- System Design Notes

---

## Team Members

- Aaron Sisourath  
- Prabesh Shrestha  
- Amy Sidon  

---

## Future Enhancements

- Mobile application (iOS/Android)
- Collaboration features (shared projects)
- Calendar integration (Google Calendar, Outlook)
- Advanced analytics and reports
- AI-based smart task suggestions

---

## Notes

- This project was developed for **CS 4398 – Software Engineering**
- The system follows a client-server architecture with a modular design
- All features are based on the Software Requirements Specification (SRS)

