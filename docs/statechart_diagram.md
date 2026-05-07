# TaskMaster Statechart Diagram

This tracks how a task moves through its lifecycle in the system.

## Task Lifecycle Statechart

```mermaid
stateDiagram-v2
    [*] --> Task_Created : create_task()

    Task_Created --> Pending : initialized

    Pending --> In_Progress : Start Working
    Pending --> Archived : Remove/Delete

    In_Progress --> Pending : Pause Task
    In_Progress --> Completed : Submit/Finish
    In_Progress --> Archived : Remove/Delete

    Completed --> In_Progress : Re-open (Needs Revision)
    Completed --> Archived : Cleanup

    Archived --> Pending : Restore
    Archived --> [*] : Permanently Deleted

    note right of Pending : status = 'Pending'\n(default on creation)
    note right of In_Progress : status = 'In Progress'\n(matches DB value)
    note right of Completed : status = 'Completed'\nNotification auto-created
    note right of Archived : status = 'Archived'
` ``
```

## How to update:
1. Open `docs/statechart_diagram.md` in VS Code
2. Select all (`Cmd + A`) and delete
3. Paste the code above
4. Save (`Cmd + S`)
5. Then push:
```bash
git add docs/statechart_diagram.md
git commit -m "Update statechart to match actual backend status values"
git push origin main
```
