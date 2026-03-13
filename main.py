from fastapi import FastAPI
from app.db.sqlite import create_db_and_tables
from app.router import router
from dotenv import load_dotenv
from app.router.middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.on_event("startup")
def on_startup():
    load_dotenv()
    create_db_and_tables()


app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthMiddleware)
