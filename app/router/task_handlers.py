from fastapi import Request,Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schema.schema import APIResponse, TaskCreate
from app.services.task_service import TaskService
from . import router
from app.db.sqlite import SessionDep

# Just for documentation
auth_scheme = HTTPBearer()

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
async def create_task(request:Request,task: TaskCreate, session: SessionDep, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    service = TaskService(session=session)
    try:
        resp_task = service.create_task(request.state.user_id,task)
        return APIResponse(message="task created successfully", data=resp_task)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
