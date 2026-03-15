from sqlmodel import SQLModel
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from pydantic import BaseModel, field_validator
from datetime import datetime, timezone
from typing import Optional

from app.db.models import Status

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    due_date: str  
    original_tz: str 

class TaskUpdate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: str 
    original_tz: str
    status: Status

    # @field_validator("status")
    # @classmethod
    # def validate_status(cls, v: int | None) -> Status | None:
    #     if v is not None:
    #         return Status(v)  # raises ValueError if invalid int
    #     return None
    
class TaskAnalyticsResponse(BaseModel):
    total_tasks: int
    status_breakdown: dict[str, int]  # e.g. {"STATUS_PENDING": 4, "STATUS_COMPLETED": 2}
    overdue_count: int
    avg_times_delayed: float
    due_soon_count: int               # tasks due within the next 7 days
    completion_rate: float     

class APIResponse(BaseModel):
    message: str
    data: Any = None

class UserCreate(SQLModel):
    email: str
    password: str

class TaskIntent(BaseModel):
    intent: Literal["create_task", "complete_task", "delay_task", "cancel_task"] = Field(
        description="The user's intended action on a task"
    )
    task_keyword: str = Field(
        description="A noun phrase or keyword extracted from the transcription that identifies the task. Used for database search."
    )
    date_time: Optional[datetime] = Field(
        default=None,
        description="Date and time mentioned by the user. Only relevant for create_task and delay_task. Null otherwise."
    )

class ParsedResponse(BaseModel):
    success: bool
    data: Optional[TaskIntent] = None
    error: Optional[str] = None
    raw_transcription: str