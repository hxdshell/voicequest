from datetime import datetime,timezone
from sqlmodel import Session

from app.db.models import Task
from app.repo.task_repo import TaskRepo
from app.schema.schema import TaskCreate

class TaskService:
    def __init__(self, session: Session):
        self.repo = TaskRepo(session)
    
    def _parse_utc(self,iso_string: str) -> datetime:
        return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
    
    def create_task(self, user_id: int, task: TaskCreate):
        utc = self._parse_utc(iso_string=task.due_date)
        if utc <= datetime.now(timezone.utc):
            raise ValueError("Due date must be in the future")
        
        task = Task(
            user_id=user_id,
            title=task.title,
            description=task.description,
            due_date=utc,
            original_tz=task.original_tz
        )
        return self.repo.create(task)
    
    def get_all_task(self, user_id: int) -> list[Task]:
        tasks = self.repo.get_all_by_user(user_id)
        return tasks
