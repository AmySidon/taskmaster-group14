from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from helpers import log_activity, create_notification

tasks_bp = Blueprint("tasks", __name__)

VALID_PRIORITIES = {"Low", "Medium", "High"}
VALID_STATUSES = {"Pending", "In Progress", "Completed", "Archived"}


@tasks_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())
    status = request.args.get("status")
    priority = request.args.get("priority")
    project_id = request.args.get("project_id")
    search = request.args.get("search", "").strip()
    due_before = request.args.get("due_before")
    due_after = request.args.get("due_after")

    query = """
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.user_id = ?
    """
    params = [user_id]

    if status and status in VALID_STATUSES:
        query += " AND t.status = ?"
        params.append(status)
    if priority and priority in VALID_PRIORITIES:
        query += " AND t.priority = ?"
        params.append(priority)
    if project_id:
        query += " AND t.project_id = ?"
        params.append(project_id)
    if search:
        query += " AND (t.title LIKE ? OR t.description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if due_before:
        query += " AND t.due_date <= ?"
        params.append(due_before)
    if due_after:
        query += " AND t.due_date >= ?"
        params.append(due_after)

    query += " ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC"

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        tasks = [dict(row) for row in cursor.fetchall()]
        return jsonify({"tasks": tasks, "count": len(tasks)}), 200
    finally:
        conn.close()


@tasks_bp.route("/summary", methods=["GET"])
@jwt_required()
def tasks_summary():
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Archived' THEN 1 ELSE 0 END) as archived,
                SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority,
                SUM(CASE WHEN due_date < date('now') AND status != 'Completed'
                         AND status != 'Archived' THEN 1 ELSE 0 END) as overdue
            FROM tasks WHERE user_id = ?
        """, (user_id,))
        return jsonify({"summary": dict(cursor.fetchone())}), 200
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.*, p.name as project_name, p.color as project_color
            FROM tasks t LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = ? AND t.user_id = ?
        """, (task_id, user_id))
        task = cursor.fetchone()
        if not task:
            return jsonify({"error": "Task not found"}), 404
        return jsonify({"task": dict(task)}), 200
    finally:
        conn.close()


@tasks_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Task title is required"}), 400

    description = data.get("description", "").strip()
    priority = data.get("priority", "Medium")
    status = data.get("status", "Pending")
    due_date = data.get("due_date")
    project_id = data.get("project_id")

    if priority not in VALID_PRIORITIES:
        return jsonify({"error": f"Priority must be one of: {', '.join(VALID_PRIORITIES)}"}), 400
    if status not in VALID_STATUSES:
        return jsonify({"error": f"Status must be one of: {', '.join(VALID_STATUSES)}"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()
        if project_id:
            cursor.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Project not found"}), 404

        cursor.execute("""
            INSERT INTO tasks (user_id, project_id, title, description, priority, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, project_id, title, description, priority, status, due_date))
        task_id = cursor.lastrowid

        if due_date:
            create_notification(conn, user_id, task_id, f"Task '{title}' is due on {due_date}")

        log_activity(conn, user_id, "create_task", "task", task_id, f"Created task: {title}")
        conn.commit()

        cursor.execute("""
            SELECT t.*, p.name as project_name, p.color as project_color
            FROM tasks t LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        return jsonify({"message": "Task created", "task": dict(cursor.fetchone())}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        task = cursor.fetchone()
        if not task:
            return jsonify({"error": "Task not found"}), 404

        title = data.get("title", task["title"]).strip()
        description = data.get("description", task["description"])
        priority = data.get("priority", task["priority"])
        status = data.get("status", task["status"])
        due_date = data.get("due_date", task["due_date"])
        project_id = data.get("project_id", task["project_id"])

        if priority not in VALID_PRIORITIES:
            return jsonify({"error": f"Priority must be one of: {', '.join(VALID_PRIORITIES)}"}), 400
        if status not in VALID_STATUSES:
            return jsonify({"error": f"Status must be one of: {', '.join(VALID_STATUSES)}"}), 400

        cursor.execute("""
            UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?,
            due_date = ?, project_id = ?, updated_at = datetime('now') WHERE id = ?
        """, (title, description, priority, status, due_date, project_id, task_id))

        if status != task["status"]:
            create_notification(conn, user_id, task_id, f"Task '{title}' status changed to '{status}'")

        log_activity(conn, user_id, "update_task", "task", task_id, f"Updated task: {title}")
        conn.commit()

        cursor.execute("""
            SELECT t.*, p.name as project_name, p.color as project_color
            FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?
        """, (task_id,))
        return jsonify({"message": "Task updated", "task": dict(cursor.fetchone())}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>/status", methods=["PATCH"])
@jwt_required()
def update_task_status(task_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    status = data.get("status")

    if not status or status not in VALID_STATUSES:
        return jsonify({"error": f"Status must be one of: {', '.join(VALID_STATUSES)}"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        task = cursor.fetchone()
        if not task:
            return jsonify({"error": "Task not found"}), 404

        cursor.execute("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?", (status, task_id))
        create_notification(conn, user_id, task_id, f"Task '{task['title']}' status changed to '{status}'")
        log_activity(conn, user_id, "update_status", "task", task_id, f"Status → {status}: {task['title']}")
        conn.commit()
        return jsonify({"message": f"Task status updated to '{status}'"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        task = cursor.fetchone()
        if not task:
            return jsonify({"error": "Task not found"}), 404

        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        log_activity(conn, user_id, "delete_task", "task", task_id, f"Deleted task: {task['title']}")
        conn.commit()
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()