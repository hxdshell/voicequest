from sqlmodel import Session,select
from app.db.models import TranscriptLog


class TranscriptRepo:
    def __init__(self, session: Session):
        self.session = session

    def save(self, transcript: TranscriptLog)->TranscriptLog:
        try:
            self.session.add(transcript)
            self.session.commit()
            self.session.refresh(transcript)
            return transcript
        except Exception as e:
            print(e)
            self.session.rollback()

    def get_all_by_user(self,user_id: int) -> (list[TranscriptLog] | None):
        transcripts = self.session.exec(select(TranscriptLog).where(TranscriptLog.user_id == user_id))
        return transcripts