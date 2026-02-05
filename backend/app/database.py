"""
Simple in-memory database for projects and tasks.
Using a dictionary-based store for simplicity.
"""
from typing import Dict, List, Optional
from . import schemas

class Database:
    def __init__(self):
        self.projects: Dict[int, schemas.ProjectRead] = {}
        self.tasks: Dict[int, schemas.TaskRead] = {}
        self._project_counter = 1
        self._task_counter = 1
    
    def create_project(self, project: schemas.ProjectCreate) -> schemas.ProjectRead:
        """Create a new project."""
        project_id = self._project_counter
        self._project_counter += 1
        project_read = schemas.ProjectRead(id=project_id, name=project.name)
        self.projects[project_id] = project_read
        return project_read
    
    def get_project(self, project_id: int) -> Optional[schemas.ProjectRead]:
        """Get a project by ID."""
        return self.projects.get(project_id)
    
    def list_projects(self) -> List[schemas.ProjectRead]:
        """List all projects."""
        return list(self.projects.values())
    
    def create_task(self, project_id: int, task: schemas.TaskCreate) -> schemas.TaskRead:
        """Create a new task for a project."""
        task_id = self._task_counter
        self._task_counter += 1
        task_read = schemas.TaskRead(
            id=task_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            project_id=project_id
        )
        self.tasks[task_id] = task_read
        return task_read
    
    def get_task(self, task_id: int) -> Optional[schemas.TaskRead]:
        """Get a task by ID."""
        return self.tasks.get(task_id)
    
    def list_tasks(self, project_id: int, status: Optional[schemas.Status] = None) -> List[schemas.TaskRead]:
        """List tasks for a project, optionally filtered by status."""
        tasks = [task for task in self.tasks.values() if task.project_id == project_id]
        if status:
            tasks = [task for task in tasks if task.status == status]
        return tasks
    
    def update_task(self, task_id: int, task_update: schemas.TaskUpdate) -> Optional[schemas.TaskRead]:
        """Update a task."""
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        update_data = task_update.model_dump(exclude_unset=True)
        
        updated_task = schemas.TaskRead(
            id=task.id,
            title=update_data.get("title", task.title),
            description=update_data.get("description", task.description),
            status=update_data.get("status", task.status),
            priority=update_data.get("priority", task.priority),
            project_id=task.project_id
        )
        self.tasks[task_id] = updated_task
        return updated_task

# Global database instance
db = Database()

