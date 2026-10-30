
from sqlalchemy import Float, Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from db import Base
# Se requiere guardar pedido (datos del cliente, estado, total y fecha)
# Tambien se requiere guardar items del pedido (producto, cantidad y precio al momento de comprar)
from datetime import datetime
from decimal import Decimal

from sqlalchemy import  DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class ProductoDB(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    categoria: Mapped[str] = mapped_column(String, nullable=False)
    imagen: Mapped[str] = mapped_column(String, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    descripcion: Mapped[str] = mapped_column(String, default="")

class PedidoDB(Base):
    __tablename__ = "pedidos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_cliente: Mapped[str] = mapped_column(String, nullable=False)
    email_cliente: Mapped[str] = mapped_column(String, nullable=False)
    estado: Mapped[str] = mapped_column(String, default="pendiente", nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    items: Mapped[list["PedidoItemDB"]] = relationship(
        back_populates="pedido",
        cascade="all, delete-orphan",
    )
    
class PedidoItemDB(Base):
     __tablename__ = "pedido_items"

     id: Mapped[int] = mapped_column(primary_key=True)
     pedido_id: Mapped[int] = mapped_column(ForeignKey("pedidos.id"), nullable=False)
     producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
     nombre_producto: Mapped[str] = mapped_column(String, nullable=False)
     precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
     cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
     pedido: Mapped["PedidoDB"] = relationship(back_populates="items")

class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), default="cliente", nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    creado_en:Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now()),
    nullable=False