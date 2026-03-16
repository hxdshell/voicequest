from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.db.sqlite import create_db_and_tables
from app.router import router
from dotenv import load_dotenv
from app.router.middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

from app.services.model_client import ModelClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    # -- startup --
    load_dotenv()
    create_db_and_tables()
    app.state.model_client = ModelClient(eleven_api_key=os.getenv("ELEVENLABS_API_KEY"), llm_api_key=os.getenv("MISTRAL_API_KEY"))

    yield

    # -- shutdown --
    print("shutting down...")

app = FastAPI(lifespan=lifespan)


app.include_router(router)
# origins = [
#     "http://localhost:5173",
# ]

app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    # allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory="web/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse("web/dist/index.html")