from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from decimal import Decimal


class Producto(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    precio: float
    categoria: str
    imagen: str
    stock: int
    descripcion: str

# Seguimos con el checkout del backend. Agregamos esquemas para validar la solicitud, despues POST / pedidos construira porductos, validará stock, calculará el total y guardará el pedido. El navegador solo enviara IDs y cantidades: no se confiara en sus precios finales

class ItemPedidoEntrada(BaseModel):
    producto_id: int  = Field(gt = 0)
    cantidad: int = Field(gt=0, le=99)

class PedidoEntrada(BaseModel):
    nombre_cliente: str = Field(min_length=2, max_length=100)
    email_cliente: EmailStr
    items: list[ItemPedidoEntrada] = Field(min_length=1)

class PedidoItemSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    nombre_producto: str
    precio_unitario: Decimal
    cantidad: int

class PedidoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_cliente: str
    email_cliente: str
    estado: str
    total: Decimal
    creado_en: datetime
    items: list[PedidoItemSalida]

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