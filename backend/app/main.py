import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import schemas
from .database import db

app = FastAPI(title="Smart Task Tracker API (Scaffold)", version="0.0.1")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

# --- Implemented routes ---
@app.get("/api/projects", response_model=List[schemas.ProjectRead])
def list_projects():
    """List all projects."""
    return db.list_projects()

@app.post("/api/projects", response_model=schemas.ProjectRead, status_code=201)
def create_project(body: schemas.ProjectCreate):
    """Create a new project."""
    try:
        return db.create_project(body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/projects/{project_id}", status_code=204)
def delete_project(project_id: int):
    """Delete a project and all of its tasks."""
    deleted = db.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")

@app.get("/api/projects/{project_id}/tasks", response_model=List[schemas.TaskRead])
def list_tasks(project_id: int, status: Optional[schemas.Status] = Query(None)):
    """List tasks for a project, optionally filtered by status."""
    # Verify project exists
    project = db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.list_tasks(project_id, status)

@app.post("/api/projects/{project_id}/tasks", response_model=schemas.TaskRead)
def create_task(project_id: int, body: schemas.TaskCreate):
    """Create a new task for a project."""
    # Verify project exists
    project = db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.create_task(project_id, body)

@app.patch("/api/tasks/{task_id}", response_model=schemas.TaskRead)
def update_task(task_id: int, body: schemas.TaskUpdate):
    """Update a task."""
    updated_task = db.update_task(task_id, body)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@app.post("/api/ai/intake", response_model=schemas.AIIntakeResponse)
def ai_intake(body: schemas.AIIntakeRequest):
    """
    Fake AI intake adapter that suggests title and priority based on input text.
    This is a deterministic fake implementation for demonstration purposes.
    """
    input_text = body.input.lower()
    
    # Simple heuristic-based fake AI:
    # - Extract first sentence or first 50 chars as title
    # - Determine priority based on keywords
    title = input_text.split('.')[0].strip()
    if len(title) > 50:
        title = title[:50].rsplit(' ', 1)[0] + "..."
    if not title:
        title = input_text[:50].strip()
    
    # Priority detection based on keywords
    priority: schemas.Priority = "Med"
    high_priority_keywords = ["urgent", "asap", "critical", "important", "emergency", "deadline", "fix", "bug", "broken"]
    low_priority_keywords = ["nice to have", "optional", "later", "someday", "maybe"]
    
    if any(keyword in input_text for keyword in high_priority_keywords):
        priority = "High"
    elif any(keyword in input_text for keyword in low_priority_keywords):
        priority = "Low"
    
    # Capitalize first letter of title
    if title:
        title = title[0].upper() + title[1:] if len(title) > 1 else title.upper()
    
    return schemas.AIIntakeResponse(title=title, priority=priority)