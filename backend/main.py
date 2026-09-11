from fastapi import FastAPI

app = FastAPI(title="MiTienda API - Día 1")

# En Semana 2 conectaremos esto con el frontend
PRODUCTS_MOCK = [
    {"id": 1, "nombre": "Laptop Dev Pro 14", "precio": 1299},
    {"id": 2, "nombre": "Auriculares Noise-Cancel", "precio": 199},
]

@app.get("/")
def root():
    return {"mensaje": "API MiTienda funcionando. Ve a /docs"}

@app.get("/productos")
def listar_productos():
    return PRODUCTS_MOCK
