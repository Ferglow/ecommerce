import os
from datetime import UTC, datetime, timedelta
import jwt
from pwdlib import PasswordHash

password_hasher = PasswordHash.recommended()

SSECRET_KEY = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion")
ALGORITHM = "HS256"
TOKEN_MINUTES = 30

def hash_password(password: str) -> str:
    return password_hasher.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)

def create_access_token(user_id: int, role: str) -> str:
    expires = datetime.now(UTC) + timedelta(minutes=TOKEN_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expires}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

