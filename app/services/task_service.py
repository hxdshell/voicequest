from datetime import datetime, timezone

from sqlmodel import Session
from app.repo.task_repo import TaskRepo
from app.db.models import Task
from app.schema.schema import TaskCreate
from sqlalchemy.exc import IntegrityError

def parse_utc(iso_string: str) -> datetime:
    return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))

class TaskService:
    def __init__(self, session: Session):
        self.repo = TaskRepo(session)
        
    def create_task(self,user_id: int, data: TaskCreate) -> Task:
        utc = parse_utc(iso_string=data.due_date)

        if utc <= datetime.now(timezone.utc):
            raise ValueError("Due date must be in the future")
        
        user = Task(user_id=user_id, 
                    title=data.title, 
                    description=data.description,
                    due_date=utc,
                    original_tz="Asia/Kolkata")
        
        try:
            return self.repo.create(user)
        except IntegrityError:
            raise ValueError("invalid data")
        
    def get_all_task(self, user_id: int) -> list[Task]:
        tasks = self.repo.get_all(user_id)
        return tasks

