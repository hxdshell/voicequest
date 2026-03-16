from sqlmodel import select,Session
from sqlalchemy.exc import IntegrityError
from app.db.models import User

class UserRepo:
    def __init__(self, session: Session):
        self.session = session

    def save(self, user: User) -> User:
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        except IntegrityError as e:
            self.session.rollback()
            raise e
    
    def get_by_email(self,email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()