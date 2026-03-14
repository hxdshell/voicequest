from elevenlabs.client import ElevenLabs
from fastapi import UploadFile

class ElevenClient:
    def __init__(self, api_key: str):
        self.elevenlabs = ElevenLabs(api_key=api_key)

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


