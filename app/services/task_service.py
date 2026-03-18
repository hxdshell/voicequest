from datetime import datetime,timezone
from zoneinfo import ZoneInfo
from sqlmodel import Session

from sqlalchemy.exc import NoResultFound, MultipleResultsFound

from app.db.models import Status, Task
from app.repo.task_repo import TaskRepo
from app.schema.schema import TaskAnalyticsResponse, TaskCreate, TaskUpdate

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
        return self.repo.save(task)
    
    def get_all_task(self, user_id: int) -> list[Task]:
        tasks = self.repo.get_all_by_user(user_id)
        return tasks

    def update(
        self,
        task_id: int,
        user_id: int,
        data: TaskUpdate
    ) -> Task:
        try:
            task = self.repo.get_by_id(task_id=task_id, user_id=user_id)
        except Exception:
            raise ValueError("task not found")

        if data.title is not None:
            task.title = data.title

        if data.description is not None:
            task.description = data.description

        if data.original_tz is not None:
            task.original_tz = data.original_tz

        if data.status is not None:
            if data.status == Status.STATUS_DELAYED:
                if data.due_date is None:
                    raise ValueError("due_date is required when delaying a task")
                due_date = datetime.strptime(data.due_date, "%Y-%m-%d %H:%M").replace(
                    tzinfo=ZoneInfo(data.original_tz))
                if due_date <= datetime.now(timezone.utc):
                    raise ValueError("New due date must be in the future")
                task.due_date = data.due_date
                task.times_dealyed += 1
            else:
                if task.due_date != data.due_date:
                    raise ValueError("You need to delay the task to change the date")
            task.status = Status(data.status)

        return self.repo.save(task)
    
    def delete(self, task_id: int, user_id: int) -> None:
        try:
            task = self.repo.get_by_id(task_id=task_id, user_id=user_id)
            self.repo.delete(task)
        except (NoResultFound, MultipleResultsFound):
            raise ValueError("task not found")
        
    def get_task_analytics(self, user_id: int):
        data = self.repo.get_analytics(user_id)

        # optional derived metrics (useful for graphs)
        total = data["total"] or 1  # avoid division by zero

        data["completion_rate"] = data["completed"] / total
        data["on_time_rate"] = data["completed_on_time"] / total
        data["delay_rate"] = data["completed_after_delay"] / total

        return data