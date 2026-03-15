from click import File
from fastapi import Request,Depends, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schema.schema import APIResponse, TaskCreate
from app.services.model_client import ModelClient
from app.services.task_service import TaskService
from . import get_model_client, router
from app.db.sqlite import SessionDep

# Just for documentation
auth_scheme = HTTPBearer()

@router.post("/voice")
async def transcribe_user_intent(audio: UploadFile = File(...), client: ModelClient = Depends(get_model_client)):
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        return JSONResponse(status_code=400, content={
            "message": "invalid file format",
            "data": None
        })

    try:
        transcription = client.transcribe(audio)
        return APIResponse(message="transcription successful", data={"transcription": transcription.text})

    except Exception as e:
        return JSONResponse(status_code=400, content={
            "message": "unable to transcribe. please try again.",
            "data": None
        })

@router.get("/tasks")
async def get_all_tasks(request:Request, session: SessionDep, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    service = TaskService(session=session)
    try:
        resp_tasks = service.get_all_task(request.state.user_id)
        return APIResponse(message="tasks fetched successfully", data=resp_tasks)
    except Exception as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })

@router.post("/tasks/create")
async def create_task(
    request: Request,
    task: TaskCreate,
    session: SessionDep,
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    print(task)
    service = TaskService(session=session)
    try:
        resp_task = service.create_task(request.state.user_id,task)
        return APIResponse(message="task created successfully", data=resp_task)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
