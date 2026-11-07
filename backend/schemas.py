from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Literal 

class Producto(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    precio: float
    categoria: str
    imagen: str
    stock: float
    unidad_medida: str = "pza"
    codigo_barras: str | None = None
    descripcion: str

class ItemPedidoEntrada(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: float = Field(gt=0)  # Soporta cantidades decimales (ej. 1.250 kg)

class PedidoEntrada(BaseModel):
    nombre_cliente: str = Field(min_length=2, max_length=100)
    email_cliente: EmailStr
    items: list[ItemPedidoEntrada] = Field(min_length=1)
    metodo_pago: Literal["efectivo", "tarjeta"] = "efectivo"

class PedidoItemSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    nombre_producto: str
    precio_unitario: Decimal
    cantidad: float
    unidad_medida: str = "pza"

class PedidoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_cliente: str
    email_cliente: str
    estado: str
    total: Decimal
    creado_en: datetime
    items: list[PedidoItemSalida]
    metodo_pago: str

class UsuarioRegistro(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UsuarioSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: EmailStr
    rol: str
    activo: bool

class TokenSalida(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioSalida

class ProductoCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    precio: float = Field(gt=0)
    categoria: str = Field(min_length=2, max_length=50)
    imagen: str = Field(default="📦")
    stock: float = Field(ge=0, default=0.0)
    unidad_medida: str = Field(default="pza")  # 'pza' o 'kg'
    codigo_barras: str | None = None
    descripcion: str = Field(default="")

class ProductoActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    precio: float | None = Field(default=None, gt=0)
    categoria: str | None = Field(default=None, min_length=2, max_length=50)
    imagen: str | None = None
    stock: float | None = Field(default=None, ge=0)
    unidad_medida: str | None = None
    codigo_barras: str | None = None
    descripcion: str | None = None