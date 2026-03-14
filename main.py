import os

from fastapi import FastAPI, Request
from app.db.sqlite import create_db_and_tables
from app.router import router
from dotenv import load_dotenv
from app.router.middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

from app.services.eleven import ElevenClient

app = FastAPI()

@app.on_event("startup")
def on_startup():
    load_dotenv()
    create_db_and_tables()
    app.state.eleven_client = ElevenClient(api_key=os.getenv("ELEVENLABS_API_KEY"))



app.include_router(router)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)
