from mistralai.client import Mistral
from elevenlabs.client import ElevenLabs
from fastapi import UploadFile
from app.schema.schema import TaskIntent

SYSTEM_PROMPT = """You are an intent parser for a task management voice assistant.
The user will provide a natural language transcription from a voice recording.
Extract structured information from it.

Rules:
- intent mapping:
    * "create", "add", "schedule", "set up", "make" → create_task
    * "done", "finish", "complete", "mark as done", "check off" → complete_task
    * "delay", "postpone", "push back", "reschedule", "move" → delay_task
    * "cancel", "delete", "remove", "drop", "forget" → cancel_task
- task_keyword: extract the core subject/topic noun phrase. Strip filler words. 2-5 words max.
- date_time: populate ONLY for create_task or delay_task. Use ISO 8601 format.
  If no year is mentioned, assume the current year.
  If time is not mentioned, default to 09:00.
  For complete_task and cancel_task, always set date_time to null.
"""

class ModelClient:
    def __init__(self, eleven_api_key: str, llm_api_key: str):
        self.elevenlabs = ElevenLabs(api_key=eleven_api_key)
        self.llm_client = Mistral(api_key=llm_api_key)

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

    def parse_transcription(self, transcription: str) -> TaskIntent:
        if(transcription == ""):
            raise ValueError("unable to transcribe")
        from datetime import datetime
        today = datetime.now().strftime("%A, %B %d, %Y")
        user_message = f"Today is {today}.\n\nTranscription: {transcription}"

        response = self.llm_client.chat.parse(
            model="mistral-small-latest",
            temperature=0,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format=TaskIntent,  # pass Pydantic model directly
        )

        # .parsed gives you a TaskIntent instance directly — no JSON wrangling
        return response.choices[0].message.parsed