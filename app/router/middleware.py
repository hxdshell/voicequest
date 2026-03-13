from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import jwt
import os

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        algorithm = "HS256"
        public_routes = {
            "/docs",
            "/api/login",
            "/api/users/create",
        }

        # only protect /api routes
        if not request.url.path.startswith("/api"):
            return await call_next(request)
        
         # public routes
        if request.url.path in public_routes:
            return await call_next(request)

        auth = request.headers.get("Authorization")

        if not auth or not auth.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"message": "missing token", "data": None},
            )

        token = auth.split(" ")[1]

        secret_key = os.getenv("SECRET_KEY")

        try:
            payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            request.state.user_id = payload["user_id"]
            request.state.email = payload["email"]

        except jwt.PyJWTError:
            return JSONResponse(
                status_code=401,
                content={"message": "invalid token", "data": None},
            )

        return await call_next(request)