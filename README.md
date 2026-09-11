# 🛒 MiTienda E-commerce — Plan Intensivo 4 semanas

**Stack:** React + Vite + TS + Tailwind + Zustand (frontend) + FastAPI (backend)
**Meta:** Tienda esencial empleable + deploy.

## Estructura
```
ecommerce/
  frontend/  → catálogo, carrito, checkout (Semana 1 y 3)
  backend/   → FastAPI API productos/auth/pedidos (Semana 2 y 3)
```

## Progreso Día 1 (hoy)
- [x] Scaffold frontend + Tailwind + Router + Zustand
- [x] Catálogo mock con buscador + carrito funcional
- [x] Backend mock `/productos` listo para Semana 2
- [ ] RETO: ver `frontend/src/data/products.ts` y `store/cartStore.ts`

## Cómo correr
```bash
# Frontend
cd frontend && npm run dev
# Backend (semana 2)
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```
