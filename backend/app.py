import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import init_db
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.notifications import notifications_bp
from routes.activity import activity_bp

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "taskmaster-secret-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(projects_bp, url_prefix="/api/projects")
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
app.register_blueprint(activity_bp, url_prefix="/api/activity")

# This runs init_db whether you use flask run or python app.py
init_db()

@app.route("/")
def index():
    return {"message": "TaskMaster API is running", "version": "1.0.0"}, 200

@app.route("/api/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)