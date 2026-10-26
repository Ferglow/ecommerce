from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MiTienda API", version="2.0")

# CORS: permite que el frontend (Vite en cualquier puerto local) consuma la API.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Producto(BaseModel):
    id: int
    nombre: str
    precio: float
    categoria: str
    imagen: str
    stock: int
    descripcion: str


PRODUCTS_MOCK = [
    {"id": 1, "nombre": "Laptop Dev Pro 14\"", "precio": 1299, "categoria": "tech", "imagen": "💻", "stock": 10, "descripcion": "Ideal para programar Fullstack"},
    {"id": 2, "nombre": "Auriculares Noise-Cancel", "precio": 199, "categoria": "tech", "imagen": "🎧", "stock": 25, "descripcion": "Para concentrarte 6h al día"},
    {"id": 3, "nombre": "Teclado Mecánico RGB", "precio": 89, "categoria": "tech", "imagen": "⌨️", "stock": 30, "descripcion": "Táctil y rápido"},
    {"id": 4, "nombre": "Mouse Ergonómico", "precio": 49, "categoria": "tech", "imagen": "🖱️", "stock": 40, "descripcion": "Sin dolor de muñeca"},
    {"id": 5, "nombre": "Camiseta DevOS", "precio": 25, "categoria": "ropa", "imagen": "👕", "stock": 100, "descripcion": "Algodón premium"},
    {"id": 6, "nombre": "Mochila Viajera 25L", "precio": 79, "categoria": "ropa", "imagen": "🎒", "stock": 15, "descripcion": "Lleva tu laptop segura"},
    {"id": 7, "nombre": "Café Grano 1kg", "precio": 18, "categoria": "hogar", "imagen": "☕", "stock": 60, "descripcion": "Combustible de programador"},
    {"id": 8, "nombre": "Lámpara LED Escritorio", "precio": 35, "categoria": "hogar", "imagen": "💡", "stock": 20, "descripcion": "Cuida tu vista"},
    {"id": 9, "nombre": "Celular Iphone 15ProMax", "precio": 25, "categoria": "tech", "imagen": "📱", "stock": 10, "descripcion": "Estetica de 9.5"},
]


@app.get("/")
def root():
    return {"mensaje": "API MiTienda funcionando. Ve a /docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/productos", response_model=list[Producto])
def listar_productos():
    return PRODUCTS_MOCK


@app.get("/productos/{producto_id}", response_model=Producto)
def obtener_producto(producto_id: int):
    for producto in PRODUCTS_MOCK:
        if producto["id"] == producto_id:
            return producto
    raise HTTPException(status_code=404, detail="Producto no encontrado")
