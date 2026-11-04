import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UnidadMedida } from '../data/products';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  unidad_medida: UnidadMedida;
}

type ProductoParaTicket = Pick<CartItem, 'id' | 'nombre' | 'precio'> & {
  unidad_medida?: UnidadMedida;
};

interface CartState {
  items: CartItem[];
  add: (producto: ProductoParaTicket, cantidad?: number) => void;
  setCantidad: (id: number, cantidad: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (producto, cantidad = 1) =>
        set((state) => {
          const unidad = producto.unidad_medida ?? 'pza';
          const cantidadNormalizada =
            unidad === 'pza'
              ? Math.trunc(cantidad)
              : Number(cantidad.toFixed(3));

          if (cantidadNormalizada <= 0) return state;

          const existente = state.items.find((item) => item.id === producto.id);
          if (existente) {
            return {
              items: state.items.map((item) =>
                item.id === producto.id
                  ? { ...item, cantidad: item.cantidad + cantidadNormalizada }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...producto, unidad_medida: unidad, cantidad: cantidadNormalizada },
            ],
          };
        }),
      setCantidad: (id, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) => {
                  if (item.id !== id) return item;
                  const nuevaCantidad =
                    item.unidad_medida === 'pza'
                      ? Math.trunc(cantidad)
                      : Number(cantidad.toFixed(3));
                  return { ...item, cantidad: nuevaCantidad };
                }),
        })),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clear: () => set({ items: [] }),
      total: () =>
        Number(
          get()
            .items.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
            .toFixed(2),
        ),
      count: () => get().items.reduce((suma, item) => suma + item.cantidad, 0),
    }),
    { name: 'mitienda-carrito' },
  ),
);