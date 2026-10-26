import type { Product } from '../data/products';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      `No se pudo conectar con la API en ${API_URL}. ¿Está corriendo el backend?`
    );
  }

  if (!res.ok) {
    if (res.status === 404) throw new Error('Producto no encontrado');
    throw new Error(`La API respondió con error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const getProductos = (signal?: AbortSignal) =>
  request<Product[]>('/productos', signal);

export const getProducto = (id: number, signal?: AbortSignal) =>
  request<Product>(`/productos/${id}`, signal);
