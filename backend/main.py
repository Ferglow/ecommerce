from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from schemas import Producto, PedidoEntrada, PedidoSalida
from models import PedidoDB, PedidoItemDB, ProductoDB, UsuarioDB
from decimal import Decimal

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

@app.post("/pedidos", response_model=PedidoSalida, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoEntrada, db: Session = Depends(get_db)):
    cantidades = {}
    for item in datos.items:
        cantidades[item.producto_id] = (
            cantidades.get(item.producto_id, 0) + item.cantidad
        )

        productos = {}
    for producto_id, cantidad in cantidades.items():
        producto = db.get(ProductoDB, producto_id)

        if producto is None:
            raise HTTPException(status_code=404, detail=f"Producto {producto_id} no encontrado")

        if producto.stock < cantidad:
            raise HTTPException(
                status_code=409,
                detail=f"Stock insuficiente para {producto.nombre}",
            )

        productos[producto_id] = (producto, cantidad)

    total = Decimal("0.00")
    lineas = []

    for producto, cantidad in productos.values():
        precio = Decimal(str(producto.precio))
        total += precio * cantidad
        lineas.append(
            PedidoItemDB(
                producto_id=producto.id,
                nombre_producto=producto.nombre,
                precio_unitario=precio,
                cantidad=cantidad,
            )
        )

    pedido = PedidoDB(
        nombre_cliente=datos.nombre_cliente,
        email_cliente=datos.email_cliente,
        estado="pendiente",
        total=total,
        items=lineas,
    )

    try:
        for producto, cantidad in productos.values():
            producto.stock -= cantidad

        db.add(pedido)
        db.commit()
        db.refresh(pedido)
    except Exception:
        db.rollback()
        raise

    return pedido
