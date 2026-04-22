# sending fake requests to backend
# and checking if the backend responds correctly
# run in the root of the project: pytest to test
import requests

BASE_URL = "http://127.0.0.1:5001/api/tasks"

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

def test_delete_task():
    response = requests.delete(f"{BASE_URL}/1")
    assert response.status_code in [200, 204, 404, 401]