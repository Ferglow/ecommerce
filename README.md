# MiTienda POS

Sistema de punto de venta (POS) para registrar ventas de mostrador, administrar productos y consultar pedidos. La interfaz está inspirada en el flujo de caja de Square POS: catálogo de productos junto a un ticket de venta.

## Funcionalidades

- Inicio de sesión y registro de usuarios.
- Roles `cliente` y `admin`; las operaciones administrativas se validan en el backend.
- Terminal de caja con búsqueda por nombre/categoría y entrada de código de barras. Los lectores USB que funcionan como teclado pueden enviar el código seguido de Enter.
- Productos por pieza (`pza`) y por peso (`kg`), con cantidades decimales y captura manual del peso.
- Ticket con cantidades, subtotal y total estimado.
- Registro de pedido, validación de stock y descuento de inventario en el servidor.
- Cobro en efectivo simulado con cálculo de cambio y registro de tarjeta simulado; no se procesa ningún pago bancario.
- Backoffice protegido para crear, editar y eliminar productos, y consultar pedidos y actualizar su estado.
- Preferencia de tema claro/oscuro persistida en el navegador.

## Tecnologías

### Frontend

- React 19 y TypeScript 6: componentes de interfaz y tipado estático.
- Vite 8: servidor de desarrollo y empaquetado.
- React Router 7: navegación entre la caja, autenticación y backoffice.
- Tailwind CSS 4: estilos.
- Zustand 5: estado del ticket, autenticación y tema; el ticket se conserva en el almacenamiento del navegador.

### Backend

- Python y FastAPI: API HTTP y documentación interactiva.
- Pydantic 2: validación de solicitudes y respuestas.
- SQLAlchemy 2: ORM para persistencia en SQLite.
- Uvicorn: servidor ASGI de desarrollo.
- pwdlib con Argon2: hash y verificación de contraseñas.
- PyJWT: emisión y validación de tokens de acceso.

## Estructura

```text
ecommerce/
├── backend/
│   ├── db.py              conexión y sesiones SQLAlchemy
│   ├── main.py            endpoints FastAPI y lógica de pedidos
│   ├── models.py          modelos de productos, usuarios y pedidos
│   ├── schemas.py         esquemas Pydantic de entrada/salida
│   ├── security.py        contraseñas, JWT y autorización por rol
│   ├── seed.py             datos iniciales de ejemplo
│   └── requirements.txt   dependencias de Python
└── frontend/
    └── src/
        ├── App.tsx               navegación, login, registro y backoffice
        ├── components/POSTerminal.tsx caja, ticket, pesaje y cobro
        ├── data/products.ts      tipos de producto
        ├── hooks/useProducts.ts  carga y reintento de productos
        ├── lib/api.ts            llamadas HTTP al backend
        └── store/
            ├── authStore.ts      sesión del usuario
            ├── cartStore.ts      ticket/cantidades
            └── themeStore.ts     preferencia de tema
```

## Requisitos

- Node.js y npm.
- Python 3.10 o posterior.

## Ejecutar localmente

Abre dos terminales desde la raíz del repositorio.

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

En fish, activa el entorno con `source .venv/bin/activate.fish`; también puedes ejecutar `.venv/bin/uvicorn main:app --reload --port 8000` sin activarlo.

La base SQLite `mitienda.db` se crea en `backend/` al iniciar la aplicación. Para cargar los productos de ejemplo, ejecuta una vez, desde `backend/`:

```bash
.venv/bin/python seed.py
```

Documentación interactiva de la API: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección local que muestre Vite (normalmente `http://localhost:5173`; si el puerto está ocupado, usará otro). El frontend usa `http://localhost:8000` como URL predeterminada de la API. Para cambiarla, copia `frontend/.env.example` a `frontend/.env` y configura `VITE_API_URL`.

## Flujo de una venta

1. El cajero selecciona un producto o ingresa su código de barras.
2. Para un producto por kilo, captura el peso o el importe; el peso se introduce manualmente, no se lee de una báscula conectada.
3. El frontend envía al backend los identificadores, cantidades y método de pago.
4. FastAPI valida los datos, consulta productos y stock, calcula el importe con los precios almacenados y registra el pedido junto al descuento de existencias.
5. La API devuelve el pedido creado para mostrar la confirmación.

La tarjeta y el efectivo son simulaciones de flujo de caja: no existe integración con terminal bancaria ni pasarela de pago.

## Endpoints principales

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | Público | Estado del servicio |
| GET | `/productos` | Público | Lista de productos |
| GET | `/productos/{id}` | Público | Detalle de producto |
| GET | `/productos/barcode/{codigo}` | Público | Búsqueda por código de barras |
| POST | `/auth/registro` | Público | Registro de usuario cliente |
| POST | `/auth/login` | Público | Inicio de sesión y emisión de JWT |
| POST | `/pedidos` | Usuario autenticado | Registra pedido y descuenta inventario |
| GET/POST/PUT/DELETE | `/admin/productos` | Admin | Consulta y administra productos |
| GET | `/admin/pedidos` | Admin | Consulta pedidos |
| PATCH | `/admin/pedidos/{id}` | Admin | Actualiza estado del pedido |

Los endpoints protegidos esperan `Authorization: Bearer <token>`. Swagger UI en `/docs` permite probarlos; usa **Authorize** después de iniciar sesión.

## Seguridad y configuración

- Las contraseñas se guardan como hashes Argon2, no en texto plano.
- Los tokens JWT tienen expiración.
- Para desarrollo se debe configurar `SECRET_KEY` como variable de entorno; el valor alternativo incluido en código es solo un placeholder y no es adecuado para producción.
- No subas secretos, archivos `.env` ni la base de datos con información real al repositorio.

## Verificación

En `frontend/`:

```bash
npm run build
npm run lint
```

## Limitaciones y próximos pasos

Este proyecto es un prototipo de aprendizaje, no un POS listo para producción. Usa SQLite local, no incorpora migraciones Alembic ni pruebas automatizadas del backend, y todavía requiere trabajo para manejar concurrencia de ventas, fortalecer el almacenamiento de tokens, conectar báscula física, integrar pagos reales, generar recibos y realizar cierres de caja. Antes de un despliegue real conviene revisar también el manejo monetario, autorización, secretos, CORS y copias de seguridad.
