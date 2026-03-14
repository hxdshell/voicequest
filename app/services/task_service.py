from sqlmodel import Session
from app.repo.task_repo import TaskRepo
from app.db.models import Task
from app.schema.schema import TaskCreate
from sqlalchemy.exc import IntegrityError

class TaskService:
    def __init__(self, session: Session):
        self.repo = TaskRepo(session)
        

    def create_task(self,user_id: int, data: TaskCreate) -> Task:
        user = Task(user_id=user_id, 
                    title=data.title, 
                    description=data.description,
                    due_date=data.due_date,
                    original_tz="Asia/Kolkata")
        
        try:
            return self.repo.create(user)
        except IntegrityError:
            raise ValueError("invalid data")
        
    def get_all_task(self, user_id: int) -> list[Task]:
        tasks = self.repo.get_all(user_id)
        return tasks

