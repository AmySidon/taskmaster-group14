from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from helpers import log_activity

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/", methods=["GET"])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*,
                   COUNT(t.id) as task_count,
                   SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_count
            FROM projects p
            LEFT JOIN tasks t ON t.project_id = p.id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC
        """, (user_id,))
        projects = [dict(row) for row in cursor.fetchall()]
        return jsonify({"projects": projects}), 200
    finally:
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        project = cursor.fetchone()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY due_date ASC", (project_id,))
        tasks = [dict(row) for row in cursor.fetchall()]
        result = dict(project)
        result["tasks"] = tasks
        return jsonify({"project": result}), 200
    finally:
        conn.close()


@projects_bp.route("/", methods=["POST"])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Project name is required"}), 400
    description = data.get("description", "").strip()
    color = data.get("color", "#4A90E2")
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO projects (user_id, name, description, color) VALUES (?, ?, ?, ?)",
            (user_id, name, description, color),
        )
        project_id = cursor.lastrowid
        log_activity(conn, user_id, "create_project", "project", project_id, f"Created project: {name}")
        conn.commit()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        return jsonify({"message": "Project created", "project": dict(cursor.fetchone())}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["PUT"])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        project = cursor.fetchone()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        name = data.get("name", project["name"]).strip()
        description = data.get("description", project["description"])
        color = data.get("color", project["color"])
        cursor.execute("""
            UPDATE projects SET name = ?, description = ?, color = ?,
            updated_at = datetime('now') WHERE id = ?
        """, (name, description, color, project_id))
        log_activity(conn, user_id, "update_project", "project", project_id, f"Updated project: {name}")
        conn.commit()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        return jsonify({"message": "Project updated", "project": dict(cursor.fetchone())}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        project = cursor.fetchone()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        log_activity(conn, user_id, "delete_project", "project", project_id, f"Deleted project: {project['name']}")
        conn.commit()
        return jsonify({"message": "Project deleted"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()