from datetime import datetime,timezone
from zoneinfo import ZoneInfo
from sqlmodel import Session

from app.db.models import Task
from app.repo.task_repo import TaskRepo
from app.schema.schema import TaskCreate

class TaskService:
    def __init__(self, session: Session):
        self.repo = TaskRepo(session)
    
    def create_task(self, user_id: int, task: TaskCreate):
        due_date = datetime.strptime(task.due_date, "%Y-%m-%d %H:%M").replace(
                    tzinfo=ZoneInfo(task.original_tz))
            
        if due_date <= datetime.now(timezone.utc):
            raise ValueError("Due date must be in the future")
        
        task = Task(
            user_id=user_id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            original_tz=task.original_tz
        )
        return self.repo.create(task)
    
    def get_all_task(self, user_id: int) -> list[Task]:
        tasks = self.repo.get_all_by_user(user_id)
        return tasks
