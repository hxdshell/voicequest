from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel
from datetime import datetime,UTC
from enum import IntEnum

class Status(IntEnum):
    STATUS_PENDING = 0
    STATUS_DELAYED = 1
    STATUS_COMPLETED = 2
    STATUS_CANCELLED = 3


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    email: str = Field(nullable=False, unique=True)
    password: str = Field(nullable=False)

class Task(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(nullable= False)
    description: str | None = Field(nullable=True)
    due_date: str = Field(nullable=False)
    original_tz: str = Field(nullable=False)
    status: Status = Field(default=Status.STATUS_PENDING, nullable=False)
    times_dealyed: int = Field(default=0,nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
