from fastapi import APIRouter
from h11 import Request

from app.services.eleven import ElevenClient

def get_eleven_client(request: Request) -> ElevenClient:
    return request.app.state.eleven_client
router = APIRouter(prefix="/api")

from . import user_handlers
from . import task_handlers