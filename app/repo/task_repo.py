from sqlmodel import Session, select
from app.db.models import Task
from sqlalchemy.exc import IntegrityError

class TaskRepo:
    def __init__(self, session: Session):
        self.session = session

    def create(self, task: Task)->Task:
        try:
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)
            return task
        except IntegrityError as e:
            self.session.rollback()
            raise e

    def get_all(self,user_id: int) -> list[Task]:
        tasks = self.session.exec(select(Task).where(Task.user_id == user_id))
        return tasks


