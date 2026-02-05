"""
Backend API tests: happy path and error path scenarios.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

def setup_function():
    """Reset database before each test."""
    db.projects.clear()
    db.tasks.clear()
    db._project_counter = 1
    db._task_counter = 1

def test_create_and_list_projects():
    """Happy path: Create a project and list it."""
    # Create a project
    response = client.post("/api/projects", json={"name": "Test Project"})
    assert response.status_code == 200
    project = response.json()
    assert project["id"] == 1
    assert project["name"] == "Test Project"
    
    # List projects
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) == 1
    assert projects[0]["name"] == "Test Project"

def test_create_task_and_list_with_filter():
    """Happy path: Create tasks and filter by status."""
    # Create a project
    project_response = client.post("/api/projects", json={"name": "My Project"})
    project_id = project_response.json()["id"]
    
    # Create tasks with different statuses
    task1 = client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Task 1", "status": "Todo", "priority": "High"}
    ).json()
    
    task2 = client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Task 2", "status": "Done", "priority": "Med"}
    ).json()
    
    # List all tasks
    all_tasks = client.get(f"/api/projects/{project_id}/tasks").json()
    assert len(all_tasks) == 2
    
    # Filter by status
    todo_tasks = client.get(f"/api/projects/{project_id}/tasks?status=Todo").json()
    assert len(todo_tasks) == 1
    assert todo_tasks[0]["id"] == task1["id"]
    
    done_tasks = client.get(f"/api/projects/{project_id}/tasks?status=Done").json()
    assert len(done_tasks) == 1
    assert done_tasks[0]["id"] == task2["id"]

def test_update_task():
    """Happy path: Update a task."""
    # Create project and task
    project = client.post("/api/projects", json={"name": "Project"}).json()
    task = client.post(
        f"/api/projects/{project['id']}/tasks",
        json={"title": "Original Title", "status": "Todo", "priority": "Low"}
    ).json()
    
    # Update task
    updated = client.patch(
        f"/api/tasks/{task['id']}",
        json={"title": "Updated Title", "status": "In-Progress", "priority": "High"}
    ).json()
    
    assert updated["title"] == "Updated Title"
    assert updated["status"] == "In-Progress"
    assert updated["priority"] == "High"
    assert updated["id"] == task["id"]

def test_create_task_nonexistent_project():
    """Error path: Try to create a task for a non-existent project."""
    response = client.post(
        "/api/projects/999/tasks",
        json={"title": "Task", "priority": "Med"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_list_tasks_nonexistent_project():
    """Error path: Try to list tasks for a non-existent project."""
    response = client.get("/api/projects/999/tasks")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_update_nonexistent_task():
    """Error path: Try to update a non-existent task."""
    response = client.patch(
        "/api/tasks/999",
        json={"title": "Updated"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_ai_intake():
    """Happy path: Test AI intake with different inputs."""
    # High priority detection
    response = client.post("/api/ai/intake", json={"input": "URGENT: Fix the critical bug in production!"})
    assert response.status_code == 200
    result = response.json()
    assert result["priority"] == "High"
    assert len(result["title"]) > 0
    
    # Low priority detection
    response = client.post("/api/ai/intake", json={"input": "Maybe we could add this nice to have feature later"})
    assert response.status_code == 200
    result = response.json()
    assert result["priority"] == "Low"
    
    # Medium priority (default)
    response = client.post("/api/ai/intake", json={"input": "Regular task description here"})
    assert response.status_code == 200
    result = response.json()
    assert result["priority"] == "Med"

