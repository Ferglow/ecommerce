import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => {
        localStorage.setItem('mitienda_token', token);
        set({ token, usuario });
      },
      logout: () => {
        localStorage.removeItem('mitienda_token');
        set({ token: null, usuario: null });
      },
    }),
    { name: 'mitienda-auth' }
  )
);