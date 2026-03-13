from fastapi import APIRouter

router = APIRouter(prefix="/api")

from . import user_handlers