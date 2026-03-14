from sqlmodel import SQLModel
from typing import Any
from pydantic import BaseModel
from datetime import datetime

class APIResponse(BaseModel):
    message: str
    data: Any = None

class UserCreate(SQLModel):
    email: str
    password: str

class TaskCreate(SQLModel):
    title: str
    description: str | None
    due_date: datetime