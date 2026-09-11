import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  add: (p: { id: number; nombre: string; precio: number }) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  add: (p) =>
    set((s) => {
      const found = s.items.find((i) => i.id === p.id);
      if (found) {
        return {
          items: s.items.map((i) =>
            i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i
          ),
        };
      }
      return { items: [...s.items, { ...p, cantidad: 1 }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
  count: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'mitienda-carrito' }
  )
);
