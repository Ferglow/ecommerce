from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from db import Base


class ProductoDB(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    categoria: Mapped[str] = mapped_column(String, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    descripcion: Mapped[str] = mapped_column(String, default=0)
