from sqlmodel import Session

from app.db.models import TranscriptLog
from app.repo.transcript_repo import TranscriptRepo


class TranscriptService:

    def __init__(self, session: Session):
        self.repo = TranscriptRepo(session)

    def create(self, user_id: int, transcription: str):
        try:
            self.repo.save(TranscriptLog(user_id=user_id,transcription=transcription))
        except Exception:
            pass # write and forget

    def get_all_transcripts(self, user_id: int) -> list[TranscriptLog]:
        transcripts = self.repo.get_all_by_user(user_id)
        if(transcripts is None):
            return []
        return transcripts