from fastapi import APIRouter, Request

from app.services.model_client import ModelClient

def get_model_client(request: Request) -> ModelClient:
    return request.app.state.model_client
router = APIRouter(prefix="/api")

from . import user_handlers
from . import task_handlers