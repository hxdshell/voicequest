from datetime import datetime, timezone

from sqlalchemy import Transaction
from sqlmodel import Session
from app.repo.task_repo import TaskRepo
from app.db.models import Task
from app.repo.transcript_repo import TranscriptRepo
from app.schema.schema import TaskIntent

class VoiceTaskService:
    def __init__(self, session: Session):
        self.repo = TaskRepo(session)
        self.transcriptRepo = TranscriptRepo(session)
    
    def _resolve_task(self, user_id: int, keyword: str) -> Task:
        """Find best matching task by keyword, raise if ambiguous or not found."""
        matches = self.repo.search_by_keyword(user_id=user_id, keyword=keyword)
        if not matches:
            raise ValueError(f"No task found matching '{keyword}'")
        if len(matches) > 1:
            titles = ", ".join(t.title for t in matches)
            raise ValueError(f"Multiple tasks matched '{keyword}': {titles}. Please be more specific.")
        return matches[0]

    def handle_intent(self, user_id: int, intent: TaskIntent, transcription: str) -> dict:
        match intent.intent:
            case "create_task":
                return self._handle_create(user_id, intent,transcription)
            case "complete_task":
                return self._handle_complete(user_id, intent,transcription)
            case "delay_task":
                return self._handle_delay(user_id, intent,transcription)
            case "cancel_task":
                return self._handle_cancel(user_id, intent,transcription)
            case _:
                raise ValueError("Unknown intent")

    def _handle_create(self, user_id: int, intent: TaskIntent, transcription: str) -> dict:
        if not intent.date_time:
            raise ValueError("A due date/time is required to create a task.")

        if intent.date_time <= datetime.now(timezone.utc):
            raise ValueError("Due date must be in the future")

        formatted_due_date = intent.date_time.strftime("%Y-%m-%d %H:%M")
        task = Task(
            user_id=user_id,
            title=intent.task_keyword,
            due_date=formatted_due_date,
            description=intent.task_description,
            original_tz="Asia/Kolkata"
        )
        saved = self.repo.save(task)
        self.transcriptRepo.save(transcript=Transaction(user_id=user_id,transcription=transcription))
        return {"action": "created", "task_id": saved.id, "title": saved.title, "due_date": saved.due_date}

    def _handle_complete(self, user_id: int, intent: TaskIntent, transcription: str) -> dict:
        task = self._resolve_task(user_id, intent.task_keyword)
        updated = self.repo.complete_task(task)
        self.transcriptRepo.save(transcript=Transaction(user_id=user_id,transcription=transcription))
        return {"action": "completed", "task_id": updated.id, "title": updated.title}

    def _handle_delay(self, user_id: int, intent: TaskIntent, transcription: str) -> dict:
        if not intent.date_time:
            raise ValueError("A new due date/time is required to delay a task.")
        task = self._resolve_task(user_id, intent.task_keyword)
        new_due = intent.date_time.replace(tzinfo=timezone.utc) if intent.date_time.tzinfo is None else intent.date_time
        updated = self.repo.delay_task(task, new_due_date=new_due)
        self.transcriptRepo.save(transcript=Transaction(user_id=user_id,transcription=transcription))
        return {
            "action": "delayed",
            "task_id": updated.id,
            "title": updated.title,
            "new_due_date": updated.due_date,
            "times_delayed": updated.times_dealyed,
        }

    def _handle_cancel(self, user_id: int, intent: TaskIntent, transcription: str) -> dict:
        task = self._resolve_task(user_id, intent.task_keyword)
        updated = self.repo.cancel_task(task)
        self.transcriptRepo.save(transcript=Transaction(user_id=user_id,transcription=transcription))
        return {"action": "cancelled", "task_id": updated.id, "title": updated.title}

