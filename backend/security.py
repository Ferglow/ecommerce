from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import UTC, datetime, timedelta
from sqlalchemy.orm import Session
from db import get_db
from pwdlib import PasswordHash
import jwt
import os   

password_hasher = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion")
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

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        role = payload["role"]
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    from models import UsuarioDB
    usuario = db.get(UsuarioDB, user_id)
    if usuario is None or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
        )

    return usuario

def require_admin(usuario=Depends(get_current_user)):
    if usuario.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol admin",
        )
    return usuari

