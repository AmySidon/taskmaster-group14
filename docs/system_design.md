# TaskMaster System Design Documentation

This document outlines the architectural and behavioral design of the TaskMaster Task Management System.

## 1. UML Class Diagram
This diagram represents the static structure of the system, illustrating the relationships between students, their courses, and the associated tasks.

```mermaid
classDiagram
    direction LR
    class Student {
        +int student_id
        +string name
        +string university_email
        +string password_hash
        +register()
        +login()
    }

    class Course {
        +int course_id
        +string course_code
        +string semester
        +add_assignment()
    }

    class Task {
        +int task_id
        +string title
        +string description
        +enum priority
        +enum status
        +datetime due_date
        +mark_as_done()
    }

    Student "1" --> "0..*" Course : enrolled_in
    Course "1" *-- "0..*" Task : has_assignments



stateDiagram-v2
    [*] --> Pending : Task Created
    
    Pending --> In_Progress : Start Working
    Pending --> Archived : Remove/Delete
    
    In_Progress --> Completed : Submit/Finish
    In_Progress --> Pending : Pause Task
    
    Completed --> Archived : Cleanup
    Completed --> In_Progress : Re-open (Needs Revision)
    
    Archived --> [*] : Permanently Deleted
