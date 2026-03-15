import json
import re

from elevenlabs.client import ElevenLabs
from fastapi import UploadFile
from google import genai
from google.genai import types
from datetime import datetime

from app.schema.schema import TaskIntent

SYSTEM_PROMPT = """You are an intent parser for a task management voice assistant.

The user will provide a natural language transcription from a voice recording.
Your job is to extract structured information from it.

Return ONLY a valid JSON object with these exact fields:
{
  "intent": one of ["create_task", "complete_task", "delay_task", "cancel_task"],
  "task_keyword": "a concise noun phrase identifying the task (2-5 words max)",
  "datentime": "ISO 8601 datetime string if mentioned, otherwise null"
}

Rules:
- intent mapping:
    * "create", "add", "schedule", "set up", "make" → create_task
    * "done", "finish", "complete", "mark as done", "check off" → complete_task
    * "delay", "postpone", "push back", "reschedule", "move" → delay_task
    * "cancel", "delete", "remove", "drop", "forget" → cancel_task
- task_keyword: extract the core subject/topic noun phrase. Strip filler words.
- datetime: only populate for create_task or delay_task. Use ISO 8601 format.
  If no year is mentioned, assume the current year. If time is ambiguous, default to 09:00.
- Return ONLY the JSON. No explanation, no markdown, no extra text.
"""

class ModelClient:
    def __init__(self, eleven_api_key: str, google_api_key):
        self.elevenlabs = ElevenLabs(api_key=eleven_api_key)
        self.google = genai.Client(api_key=google_api_key)

    def get_eleven(self):
        return self.elevenlabs

    
    def transcribe(self, audio: UploadFile):
        transcription = self.elevenlabs.speech_to_text.convert(
            file=audio.file,
            model_id="scribe_v2",
            language_code=None,        
            tag_audio_events=True,     
            diarize=False,            
            entity_detection=["pii"]
        )
        return transcription
    
    def parse_transcription(transcription: str, client: genai.Client) -> TaskIntent:
        today = datetime.now().strftime("%A, %B %d, %Y")
        
        user_message = f"Today is {today}.\n\nTranscription: {transcription}"

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.1,  # Low temp for consistent structured output
            ),
            contents=user_message,
        )

        raw = response.text.strip()
        # Strip markdown code fences if Gemini wraps in them
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()

        parsed = json.loads(raw)
        return TaskIntent(**parsed)
    
    def close(self):
        self.google.close()


