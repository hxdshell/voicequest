from fastapi.responses import JSONResponse
from app.db.sqlite import SessionDep
from app.services.user_service import UserService
from app.schema.schema import UserCreate,APIResponse
from sqlalchemy.exc import NoResultFound
from . import router

@router.post("/users/create")
def create_user(user: UserCreate, session: SessionDep):
    service = UserService(session=session)
    try:
        resp_user = service.create_user(user)
        return APIResponse(message="user created successfully", data=resp_user)
    except ValueError as e:
        return JSONResponse(status_code=400, content={
            "message": str(e),
            "data": None
        })
    
@router.post("/login")
def create_user(user: UserCreate, session: SessionDep):
    service = UserService(session=session)
    try:
        token = service.login(user)
        return APIResponse(message="login successful", data={"token": token})
    
    except NoResultFound as e:
        return JSONResponse(status_code=404, content={
            "message": str(e),
            "data": None
        })
    except ValueError as e:
        return JSONResponse(status_code=401, content={
            "message": str(e),
            "data": None
        })
    