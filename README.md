# 🛒 MiTienda E-commerce — Plan Intensivo 4 semanas

**Stack:** React + Vite + TS + Tailwind + Zustand (frontend) + FastAPI (backend)
**Meta:** Tienda esencial empleable + deploy.

## Estructura
```
ecommerce/
  frontend/  → catálogo, carrito, checkout (Semana 1 y 3)
  backend/   → FastAPI API productos/auth/pedidos (Semana 2 y 3)
```

## Progreso
- [x] Scaffold frontend + Tailwind + Router + Zustand
- [x] Catálogo con buscador + filtros + carrito persistente
- [x] Backend FastAPI con `/productos` y `/productos/{id}`
- [x] Frontend conectado al backend (fetch + loading/error)
- [ ] Auth y pedidos reales (Semana 3)

## Cómo correr

### 1. Backend (puerto 8000)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API: http://localhost:8000
- Docs interactivas: http://localhost:8000/docs

### 2. Frontend (puerto 5173)
```bash
cd frontend
npm install
npm run dev
```
Si el puerto 5173 está ocupado, Vite usará el siguiente (5174, 5175...).

## Conexión frontend ↔ backend
- `frontend/src/lib/api.ts` centraliza las peticiones (`getProductos`, `getProducto`).
- La URL de la API se configura con `VITE_API_URL` (por defecto `http://localhost:8000`).
  Copia `frontend/.env.example` a `frontend/.env` si necesitas cambiarla.
- `frontend/src/hooks/useProducts.ts` maneja loading, errores, reintentos y cancelación.
- El backend habilita CORS para cualquier puerto local (`localhost` / `127.0.0.1`).

## Endpoints
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Mensaje de bienvenida |
| GET | `/health` | Estado del servicio |
| GET | `/productos` | Lista de productos |
| GET | `/productos/{id}` | Detalle de un producto (404 si no existe) |
