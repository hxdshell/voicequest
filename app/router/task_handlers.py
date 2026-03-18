from click import File
from fastapi import Request,Depends, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schema.schema import APIResponse, TaskAnalyticsResponse, TaskCreate, TaskUpdate
from app.services.model_client import ModelClient
from app.services.task_service import TaskService
from app.services.transcript_service import TranscriptService
from app.services.voice_task_service import VoiceTaskService
from . import get_model_client, router
from app.db.sqlite import SessionDep

# Just for documentation
auth_scheme = HTTPBearer()

@router.post("/voice")
async def handle_voice_task(request: Request,session: SessionDep , audio: UploadFile = File(...), client: ModelClient = Depends(get_model_client)):
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        return JSONResponse(status_code=400, content={
            "message": "invalid file format",
            "data": None
        })

    try:
        transcription = client.transcribe(audio=audio)
        intent = client.parse_transcription(transcription.text)
    except Exception as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })

    try:
        service = VoiceTaskService(session=session)
        result = service.handle_intent(user_id=request.state.user_id, intent=intent)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })

    return APIResponse(message="success", data = {
        "transcription": transcription.text,
        "parsed_intent": intent.model_dump(),
        "result": result,
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
    
@router.get("/transcripts")
async def get_all_tasks(request:Request, session: SessionDep, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    service = TranscriptService(session=session)
    try:
        resp_tasks = service.get_all_transcripts(request.state.user_id)
        return APIResponse(message="transcripts fetched successfully", data=resp_tasks)
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
    service = TaskService(session=session)
    try:
        resp_task = service.create_task(request.state.user_id,task)
        return APIResponse(message="task created successfully", data=resp_task)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
    
@router.put("/tasks/update/{task_id}")
async def update_task(
    task_id: int,
    request: Request,
    task: TaskUpdate,
    session: SessionDep,
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    service = TaskService(session=session)
    try:
        resp_task = service.update(task_id=task_id,user_id=request.state.user_id,data=task)
        return APIResponse(message="task updated successfully", data=resp_task)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
    
@router.delete("/tasks/delete/{task_id}")
async def delete_task(
    task_id: int,
    request: Request,
    session: SessionDep,
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    service = TaskService(session=session)
    try:
        service.delete(task_id=task_id,user_id=request.state.user_id)
        return APIResponse(message="task deleted successfully", data=None)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
    
@router.get("/tasks/analytics")
async def get_task_analytics(
   request: Request,
    session: SessionDep,
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    service = TaskService(session=session)
    try:
        analytics = service.get_task_analytics(user_id=request.state.user_id)
        return APIResponse(message="analytics data fetched successfully", data=analytics)
    except Exception as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
