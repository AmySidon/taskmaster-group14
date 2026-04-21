# Task Statechart Diagram
This tracks how an assignment (Task) moves from "Pending" to "Completed."

```mermaid
stateDiagram-v2
    [*] --> Pending : Task Created
    
    Pending --> In_Progress : Start Working
    Pending --> Archived : Remove/Delete
    
    In_Progress --> Completed : Submit/Finish
    In_Progress --> Pending : Pause Task
    
    Completed --> Archived : Cleanup
    Completed --> In_Progress : Re-open (Needs Revision)
    
    Archived --> [*] : Permanently Deleted
