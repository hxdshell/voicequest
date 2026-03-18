from sqlmodel import Session,select
from app.db.models import Transcription


class TranscriptRepo:
    def __init__(self, session: Session):
        self.session = session

    def save(self, transcript: Transcription)->Transcription:
        try:
            self.session.add(transcript)
            self.session.commit()
            self.session.refresh(transcript)
            return transcript
        except Exception as e:
            self.session.rollback()

    def get_all_by_user(self,user_id: int) -> (list[Transcription] | None):
        transcripts = self.session.exec(select(Transcription).where(Transcription.user_id == user_id))
        return transcripts