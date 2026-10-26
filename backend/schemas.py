from pydantic import BaseModel, ConfigDict


class Producto(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    precio: float
    categoria: str
    imagen: str
    stock: int
    descripcion: str
