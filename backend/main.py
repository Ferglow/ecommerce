from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from schemas import Producto, PedidoEntrada, PedidoSalida, UsuarioRegistro, UsuarioSalida, UsuarioLogin, TokenSalida, ProductoCrear
from models import PedidoDB, PedidoItemDB, ProductoDB, UsuarioDB
from decimal import Decimal
from security import hash_password, verify_password, create_access_token, get_current_user, require_admin

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
def crear_pedido(datos: PedidoEntrada, db: Session = Depends(get_db), usuario=Depends(get_current_user)):
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

@app.post("/auth/registro", response_model=UsuarioSalida, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    existente = db.query(UsuarioDB).filter(UsuarioDB.email == datos.email).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    nuevo_usuario = UsuarioDB(
        nombre=datos.nombre,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol="cliente",
        activo=True,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.post("/auth/login", response_model=TokenSalida)
def iniciar_sesion(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == datos.email).first()
    
    if not usuario or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )

    token = create_access_token(usuario.id, usuario.rol)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario,
    }

@app.post("/admin/productos", response_model=Producto, status_code=status.HTTP_201_CREATED)
def admin_crear_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    nuevo = ProductoDB(**datos.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.delete("/admin/productos/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    producto = db.get(ProductoDB, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
