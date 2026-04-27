from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
from helpers import log_activity

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Log activity
        log_activity(conn, user_id, "register", "user", user_id, f"User {username} registered")
        conn.commit()

        token = create_access_token(identity=str(user_id))
        return jsonify({
            "message": "Account created successfully",
            "token": token,
            "user": {"id": user_id, "username": username, "email": email}
        }), 201

    except Exception as e:
        conn.rollback()
        if "UNIQUE constraint failed" in str(e):
            field = "email" if "email" in str(e) else "username"
            return jsonify({"error": f"That {field} is already in use"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """Log in a user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Update last login
        cursor.execute(
            "UPDATE users SET last_login = datetime('now') WHERE id = ?", (user["id"],)
        )
        log_activity(conn, user["id"], "login", "user", user["id"], "User logged in")
        conn.commit()

        token = create_access_token(identity=str(user["id"]))
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        }), 200
    finally:
        conn.close()


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    """Get the current user's profile."""
    user_id = int(get_jwt_identity())

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, email, created_at, last_login FROM users WHERE id = ?",
            (user_id,)
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get quick stats
        cursor.execute("SELECT COUNT(*) as count FROM tasks WHERE user_id = ?", (user_id,))
        task_count = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) as count FROM projects WHERE user_id = ?", (user_id,))
        project_count = cursor.fetchone()["count"]

        return jsonify({
            "user": dict(user),
            "stats": {"tasks": task_count, "projects": project_count}
        }), 200
    finally:
        conn.close()


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update username or password."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        new_username = data.get("username", user["username"]).strip()
        new_password = data.get("password")

        updates = ["username = ?"]
        params = [new_username]

        if new_password:
            if len(new_password) < 6:
                return jsonify({"error": "Password must be at least 6 characters"}), 400
            updates.append("password_hash = ?")
            params.append(generate_password_hash(new_password))

        params.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
        log_activity(conn, user_id, "update_profile", "user", user_id, "Profile updated")
        conn.commit()

        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()