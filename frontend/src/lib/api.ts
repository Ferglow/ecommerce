import type { Product } from "../data/products";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      `No se pudo conectar con la API en ${API_URL}. ¿Está corriendo el backend?`,
    );
  }

  if (!res.ok) {
    if (res.status === 404) throw new Error("Producto no encontrado");
    throw new Error(`La API respondió con error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const getProductos = (signal?: AbortSignal) =>
  request<Product[]>("/productos", signal);

export const getProducto = (id: number, signal?: AbortSignal) =>
  request<Product>(`/productos/${id}`, signal);

export interface PedidoCreado {
  id: number;
  total: number | string;
  estado: string;
}

export async function crearPedido(datos: {
  nombre_cliente: string;
  email_cliente: string;
  items: { producto_id: number; cantidad: number }[];
}): Promise<PedidoCreado> {
  const token = localStorage.getItem('mitienda_token');

  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(datos),
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof resultado.detail === "string"
        ? resultado.detail
        : `Error de API: ${response.status}`,
    );
  }

  return resultado as PedidoCreado;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegistroInput {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
  };
}

export async function loginUsuario(datos: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al iniciar sesión');
  return data;
}

export async function registrarUsuario(datos: RegistroInput): Promise<void> {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al registrarse');
}