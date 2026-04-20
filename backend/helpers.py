def log_activity(conn, user_id, action, entity_type=None, entity_id=None, detail=None):
    """Insert a row into the activity log. Caller must commit."""
    conn.execute("""
        INSERT INTO activity (user_id, action, entity_type, entity_id, detail)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, action, entity_type, entity_id, detail))


def create_notification(conn, user_id, task_id, message):
    """Insert a notification row. Caller must commit."""
    conn.execute("""
        INSERT INTO notifications (user_id, task_id, message)
        VALUES (?, ?, ?)
    """, (user_id, task_id, message))