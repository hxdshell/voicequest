from datetime import datetime,timezone

from sqlmodel import Session, select
from app.db.models import Status, Task
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

    def get_all_by_user(self,user_id: int) -> list[Task]:
        tasks = self.session.exec(select(Task).where(Task.user_id == user_id))
        return tasks

    def get_by_id(self, task_id: int) -> Task | None:
        return self.session.get(Task, task_id)


    def search_by_keyword(self, user_id: int, keyword: str) -> list[Task]:
        """Fuzzy search by title for intent matching"""
        return self.session.exec(
            select(Task).where(
                Task.user_id == user_id,
                Task.title.ilike(f"%{keyword}%")
            )
        ).all()

    def complete_task(self, task: Task) -> Task:
        task.status = Status.STATUS_COMPLETED
        return self.create(task)

    def cancel_task(self, task: Task) -> Task:
        task.status = Status.STATUS_CANCELLED
        return self.create(task)

    def delay_task(self, task: Task, new_due_date: datetime) -> Task:
        if new_due_date <= datetime.now(timezone.utc):
            raise ValueError("New due date must be in the future")
        task.due_date = new_due_date
        task.status = Status.STATUS_DELAYED
        task.times_dealyed += 1
        return self.create(task)


