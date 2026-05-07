# sending fake requests to backend
# and checking if the backend responds correctly
# make sure requirements.txt is downloaded
# run in the root of the project: pytest tests/test_api.py -v

import requests

BASE_URL = "http://127.0.0.1:5001/api/tasks"


# ── Auth Tests ────────────────────────────────────────────────────────────────

def test_register_user():
    payload = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "password123"
    }
    response = requests.post("http://127.0.0.1:5001/api/auth/register", json=payload)
    assert response.status_code in [201, 409]

def test_login_user():
    payload = {
        "email": "testuser123@example.com",
        "password": "password123"
    }
    response = requests.post("http://127.0.0.1:5001/api/auth/login", json=payload)
    assert response.status_code in [200, 401]
    if response.status_code == 200:
        assert "token" in response.json()

def test_login_wrong_password():
    payload = {
        "email": "testuser123@example.com",
        "password": "wrongpassword"
    }
    response = requests.post("http://127.0.0.1:5001/api/auth/login", json=payload)
    assert response.status_code == 401

def test_get_profile_without_token():
    response = requests.get("http://127.0.0.1:5001/api/auth/profile")
    assert response.status_code == 401


# ── Project Tests ─────────────────────────────────────────────────────────────

def test_get_projects():
    response = requests.get("http://127.0.0.1:5001/api/projects/")
    assert response.status_code in [200, 401]

def test_create_project():
    payload = {
        "name": "Test Project",
        "description": "A test course",
        "color": "#4A90E2"
    }
    response = requests.post("http://127.0.0.1:5001/api/projects/", json=payload)
    assert response.status_code in [201, 401]

def test_create_project_missing_name():
    payload = {"description": "No name given"}
    response = requests.post("http://127.0.0.1:5001/api/projects/", json=payload)
    assert response.status_code in [400, 401]


# ── Task Tests ────────────────────────────────────────────────────────────────

def test_get_tasks():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code in [200, 401]

def test_create_task():
    payload = {
        "title": "Test Task",
        "description": "Testing API",
        "priority": "Medium",
        "status": "Pending"
    }
    response = requests.post(f"{BASE_URL}/", json=payload)
    assert response.status_code in [201, 401]

def test_create_task_missing_title():
    payload = {
        "description": "No title",
        "priority": "High"
    }
    response = requests.post(f"{BASE_URL}/", json=payload)
    assert response.status_code in [400, 401]

def test_create_task_invalid_priority():
    payload = {
        "title": "Bad Task",
        "priority": "URGENT"
    }
    response = requests.post(f"{BASE_URL}/", json=payload)
    assert response.status_code in [400, 401]

def test_get_task_summary():
    response = requests.get(f"{BASE_URL}/summary")
    assert response.status_code in [200, 401]

def test_get_single_task():
    response = requests.get(f"{BASE_URL}/1")
    assert response.status_code in [200, 404, 401]

def test_update_task_status():
    payload = {"status": "Completed"}
    response = requests.patch(f"{BASE_URL}/1/status", json=payload)
    assert response.status_code in [200, 404, 401]

def test_update_task_invalid_status():
    payload = {"status": "Done"}
    response = requests.patch(f"{BASE_URL}/1/status", json=payload)
    assert response.status_code in [400, 404, 401]

def test_delete_task():
    response = requests.delete(f"{BASE_URL}/1")
    assert response.status_code in [200, 204, 404, 401]


# ── Notification Tests ────────────────────────────────────────────────────────

def test_get_notifications():
    response = requests.get("http://127.0.0.1:5001/api/notifications/")
    assert response.status_code in [200, 401]

def test_mark_all_notifications_read():
    response = requests.patch("http://127.0.0.1:5001/api/notifications/read-all")
    assert response.status_code in [200, 401]


# ── Activity Tests ────────────────────────────────────────────────────────────

def test_get_activity():
    response = requests.get("http://127.0.0.1:5001/api/activity/")
    assert response.status_code in [200, 401]


# ── System Tests ──────────────────────────────────────────────────────────────

def test_health_check():
    response = requests.get("http://127.0.0.1:5001/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_index_route():
    response = requests.get("http://127.0.0.1:5001/")
    assert response.status_code == 200
    assert "TaskMaster" in response.json()["message"]