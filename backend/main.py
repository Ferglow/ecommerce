from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from models import ProductoDB
from schemas import Producto
from models import PedidoDB, PedidoItemDB, ProductoDB


Base.metadata.create_all(bind=engine)

app = FastAPI(title="MiTienda API", version="2.0")

# CORS: permite que el frontend (Vite en cualquier puerto local) consuma la API.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"mensaje": "API MiTienda funcionando. Ve a /docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/productos", response_model=list[Producto])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(ProductoDB).all()


@app.get("/productos/{producto_id}", response_model=Producto)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.get(ProductoDB, producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto
