from sqlmodel import SQLModel
from typing import Any
from pydantic import BaseModel

class APIResponse(BaseModel):
    message: str
    data: Any = None

class UserCreate(SQLModel):
    email: str
    password: str