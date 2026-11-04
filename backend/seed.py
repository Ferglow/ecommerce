from db import Base, SessionLocal, engine
from models import ProductoDB

PRODUCTOS = [
    # Abarrotes y piezas con código de barras
    {"id": 1, "nombre": "Coca Cola 600ml", "precio": 18.0, "categoria": "bebidas", "imagen": "🥤", "stock": 50.0, "unidad_medida": "pza", "codigo_barras": "7501055300075", "descripcion": "Refresco botella"},
    {"id": 2, "nombre": "Papas Fritas 170g", "precio": 45.0, "categoria": "snacks", "imagen": "🥔", "stock": 30.0, "unidad_medida": "pza", "codigo_barras": "7501011123456", "descripcion": "Botana salada"},
    {"id": 3, "nombre": "Leche Entera 1L", "precio": 26.5, "categoria": "lacteos", "imagen": "🥛", "stock": 20.0, "unidad_medida": "pza", "codigo_barras": "7501020304050", "descripcion": "Leche pasteurizada"},

    # Frutas y Legumbres a Granel (Por Kilo)
    {"id": 4, "nombre": "Jitomate Saladet", "precio": 32.0, "categoria": "frutas_verduras", "imagen": "🍅", "stock": 45.5, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
    {"id": 5, "nombre": "Plátano Tabasco", "precio": 24.0, "categoria": "frutas_verduras", "imagen": "🍌", "stock": 30.0, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
    {"id": 6, "nombre": "Aguacate Hass", "precio": 75.0, "categoria": "frutas_verduras", "imagen": "🥑", "stock": 25.0, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
    {"id": 7, "nombre": "Manzana Golden", "precio": 48.0, "categoria": "frutas_verduras", "imagen": "🍎", "stock": 20.0, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
    {"id": 8, "nombre": "Cebolla Blanca", "precio": 28.0, "categoria": "frutas_verduras", "imagen": "🧅", "stock": 35.0, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
    {"id": 9, "nombre": "Limón con Semilla", "precio": 38.0, "categoria": "frutas_verduras", "imagen": "🍋", "stock": 40.0, "unidad_medida": "kg", "codigo_barras": None, "descripcion": "Precio por kilogramo"},
]

def seed():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.query(ProductoDB).count() > 0:
            print("Ya hay productos; no se inserta nada.")
            return
        db.add_all([ProductoDB(**p) for p in PRODUCTOS])
        db.commit()
    print(f"Insertados {len(PRODUCTOS)} productos con unidades y códigos de barras.")

if __name__ == "__main__":
    seed()