from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db

activity_bp = Blueprint("activity", __name__)


@activity_bp.route("/", methods=["GET"])
@jwt_required()
def get_activity():
    user_id = int(get_jwt_identity())
    limit = min(int(request.args.get("limit", 50)), 200)
    entity_type = request.args.get("entity_type")

    conn = get_db()
    try:
        cursor = conn.cursor()
        query = "SELECT * FROM activity WHERE user_id = ?"
        params = [user_id]

        if entity_type:
            query += " AND entity_type = ?"
            params.append(entity_type)

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        logs = [dict(row) for row in cursor.fetchall()]
        return jsonify({"activity": logs, "count": len(logs)}), 200
    finally:
        conn.close()