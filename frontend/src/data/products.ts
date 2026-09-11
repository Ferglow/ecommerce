export interface Product {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: number;
  descripcion: string;
}

// Mock inicial — en Semana 2 esto vendrá de FastAPI
export const products: Product[] = [
  { id: 1, nombre: 'Laptop Dev Pro 14"', precio: 1299, categoria: 'tech', imagen: '💻', stock: 10, descripcion: 'Ideal para programar Fullstack' },
  { id: 2, nombre: 'Auriculares Noise-Cancel', precio: 199, categoria: 'tech', imagen: '🎧', stock: 25, descripcion: 'Para concentrarte 6h al día' },
  { id: 3, nombre: 'Teclado Mecánico RGB', precio: 89, categoria: 'tech', imagen: '⌨️', stock: 30, descripcion: 'Táctil y rápido' },
  { id: 4, nombre: 'Mouse Ergonómico', precio: 49, categoria: 'tech', imagen: '🖱️', stock: 40, descripcion: 'Sin dolor de muñeca' },
  { id: 5, nombre: 'Camiseta DevOS', precio: 25, categoria: 'ropa', imagen: '👕', stock: 100, descripcion: 'Algodón premium' },
  { id: 6, nombre: 'Mochila Viajera 25L', precio: 79, categoria: 'ropa', imagen: '🎒', stock: 15, descripcion: 'Lleva tu laptop segura' },
  { id: 7, nombre: 'Café Grano 1kg', precio: 18, categoria: 'hogar', imagen: '☕', stock: 60, descripcion: 'Combustible de programador' },
  { id: 8, nombre: 'Lámpara LED Escritorio', precio: 35, categoria: 'hogar', imagen: '💡', stock: 20, descripcion: 'Cuida tu vista' },
  {id: 8, nombre: 'Celular Iphone 15ProMax', precio: 25, categoria: 'tech', imagen: '📱', stock: 10, descripcion: "Estetica de 9.5"},
];
