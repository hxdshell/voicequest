from sqlmodel import Session
from app.repo.user_repo import UserRepo
from app.db.models import User
from pwdlib import PasswordHash
from app.schema.schema import UserCreate
from sqlalchemy.exc import IntegrityError, NoResultFound
from datetime import datetime, timedelta, timezone
import os
import jwt

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    secret_key = os.getenv("SECRET_KEY")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt

class UserService:

    def __init__(self, session: Session):
        self.repo = UserRepo(session)
        self.hash_pwd = PasswordHash.recommended()


    def login(self, data: UserCreate)->str:
        user = self.repo.get_by_email(data.email)
        if (not user):
            raise NoResultFound("email does not exist")
        
        is_match = self.hash_pwd.verify(data.password,user.password)
        if (not is_match):
            raise ValueError("invalid credentials")
        
        access_token_expires = timedelta(minutes=180)
        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email}, expires_delta=access_token_expires
        )
        return access_token
        

    def create_user(self, data: UserCreate) -> User:
        hashed_pwd = self.hash_pwd.hash(data.password)
        user = User(email=data.email, password=hashed_pwd)
        
        try:
            return self.repo.create(user)
        except IntegrityError:
            raise ValueError("email already exists")
            