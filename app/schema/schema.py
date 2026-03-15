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
    due_date: str  # ISO string e.g. "2025-03-15T14:30:00"
    original_tz: str  # e.g. "Asia/Kolkata"

    @field_validator("due_date")
    @classmethod
    def parse_due_date(cls, v: str) -> str:
        # Just validate it's a parseable ISO string, store as-is
        datetime.fromisoformat(v)
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    original_tz: Optional[str] = None
    status: Optional[int] = None

    @field_validator("due_date")
    @classmethod
    def parse_due_date(cls, v: str | None) -> str | None:
        if v is not None:
            datetime.fromisoformat(v)
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: int | None) -> Status | None:
        if v is not None:
            return Status(v)  # raises ValueError if invalid int
        return None

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