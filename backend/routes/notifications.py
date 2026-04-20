from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    unread_only = request.args.get("unread") == "true"

    conn = get_db()
    try:
        cursor = conn.cursor()
        query = """
            SELECT n.*, t.title as task_title
            FROM notifications n
            LEFT JOIN tasks t ON n.task_id = t.id
            WHERE n.user_id = ?
        """
        params = [user_id]
        if unread_only:
            query += " AND n.is_read = 0"
        query += " ORDER BY n.created_at DESC LIMIT 50"

        cursor.execute(query, params)
        notifications = [dict(row) for row in cursor.fetchall()]

        cursor.execute(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
            (user_id,)
        )
        unread_count = cursor.fetchone()["count"]
        return jsonify({"notifications": notifications, "unread_count": unread_count}), 200
    finally:
        conn.close()


@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user_id)
        )
        if cursor.rowcount == 0:
            return jsonify({"error": "Notification not found"}), 404
        conn.commit()
        return jsonify({"message": "Notification marked as read"}), 200
    finally:
        conn.close()


@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        return jsonify({"message": "All notifications marked as read"}), 200
    finally:
        conn.close()


@notifications_bp.route("/<int:notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    user_id = int(get_jwt_identity())
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM notifications WHERE id = ? AND user_id = ?", (notif_id, user_id)
        )
        if cursor.rowcount == 0:
            return jsonify({"error": "Notification not found"}), 404
        conn.commit()
        return jsonify({"message": "Notification deleted"}), 200
    finally:
        conn.close()