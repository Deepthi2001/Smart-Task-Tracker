import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import schemas

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

# --- Stubs for candidate to implement ---
@app.get("/api/projects", response_model=List[schemas.ProjectRead])
def list_projects():
    raise HTTPException(status_code=501, detail="Not Implemented")

@app.post("/api/projects", response_model=schemas.ProjectRead)
def create_project(body: schemas.ProjectCreate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@app.get("/api/projects/{project_id}/tasks", response_model=List[schemas.TaskRead])
def list_tasks(project_id: int, status: Optional[schemas.Status] = Query(None)):
    raise HTTPException(status_code=501, detail="Not Implemented")

@app.post("/api/projects/{project_id}/tasks", response_model=schemas.TaskRead)
def create_task(project_id: int, body: schemas.TaskCreate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@app.patch("/api/tasks/{task_id}", response_model=schemas.TaskRead)
def update_task(task_id: int, body: schemas.TaskUpdate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@app.post("/api/ai/intake", response_model=schemas.AIIntakeResponse)
def ai_intake(body: schemas.AIIntakeRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")