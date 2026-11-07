import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "./data/products";
import { useTheme } from "./store/themeStore";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import { useProducto } from "./hooks/useProducts";
import { useCart } from "./store/cartStore";
import { useAuth } from "./store/authStore";
import { useNavigate, Navigate } from "react-router-dom";
import {
  crearPedido,
  type PedidoCreado,
  type PedidoAdmin,
  loginUsuario,
  registrarUsuario,
  crearProductoAdmin,
  adminListarProductos,
  adminActualizarProducto,
  adminEliminarProducto,
  adminListarPedidos,
  adminCambiarEstado,
} from "./lib/api";
import { POSTerminal } from "./components/POSTerminal";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

//Componentes
function Navbar() {
  const count = useCart((s) => s.count());
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 text-slate-100 backdrop-blur-xl">
      <Link
        to="/"
        className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
          🛒
        </span>
        MiTienda
      </Link>

      <div className="flex items-center gap-4">
        {/* BOTÓN TOGGLE TEMA (Aquí es donde se usa toggleTheme y theme) */}
        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link to="/" className="transition-colors hover:text-white">
          Catálogo
        </Link>
        {usuario?.rol === "admin" && (
          <Link
            to="/admin"
            className="transition-colors hover:text-violet-400 font-semibold"
          >
            Admin
          </Link>
        )}
        <Link
          to="/carrito"
          className="transition-colors hover:text-white flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          <span>🛒 Carrito</span>
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white">
            {count}
          </span>
        </Link>
        {usuario ? (
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <span className="text-xs text-slate-400">
              Hola, <strong className="text-slate-200">{usuario.nombre}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-slate-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/registro"
              className="rounded-xl bg-violet-600 px-4 py-1.5 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all"
            >
              Registro
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function Cargando({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-6 text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      {mensaje}
    </div>
  );
}

function ErrorApi({
  mensaje,
  onRetry,
}: {
  mensaje: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <p>{mensaje}</p>
      <button
        onClick={onRetry}
        className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}

function Detalle() {
  const { id } = useParams();
  const add = useCart((s) => s.add);
  const productoId = Number(id);
  const {
    data: p,
    loading,
    error,
    retry,
  } = useProducto(Number.isFinite(productoId) ? productoId : undefined);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link to="/" className="text-sm text-violet-600 underline">
          ← Volver al catálogo
        </Link>
        <div className="mt-4">
          <Cargando mensaje="Cargando producto..." />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link to="/" className="text-sm text-violet-600 underline">
          ← Volver al catálogo
        </Link>
        <div className="mt-4">
          <ErrorApi mensaje={error} onRetry={retry} />
        </div>
      </main>
    );
  }

  if (!p) {
    return (
      <p className="p-6">
        Producto no encontrado.{" "}
        <Link to="/" className="underline">
          Volver
        </Link>
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-violet-600 underline">
        ← Volver al catálogo
      </Link>
      <div className="mt-4 rounded-xl border bg-white p-6">
        <div className="text-7xl">{p.imagen}</div>
        <h1 className="mt-2 text-3xl font-bold">{p.nombre}</h1>
        <p className="text-slate-500">
          {p.categoria} · stock: {p.stock}
        </p>
        <p className="mt-2">{p.descripcion}</p>
        <p className="mt-3 text-2xl font-bold">${p.precio}</p>
        <button
          onClick={() => add(p)}
          className="mt-4 rounded bg-violet-600 px-6 py-2 text-white"
        >
          Añadir al carrito
        </button>
      </div>
    </main>
  );
}
// Estados van guardando lo que va ocurriendo formulario, envio en curso, error o pedido
function Carrito() {
  const { items, total, remove, clear } = useCart();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);

  async function enviarPedido(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setError("");

    try {
      const creado = await crearPedido({
        nombre_cliente: nombre,
        email_cliente: email,
        items: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
        })),
      });

      setPedido(creado);
      clear();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el pedido",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (pedido) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">¡Pedido creado!</h1>
        <p>Número: {pedido.id}</p>
        <p>Total confirmado por el servidor: ${pedido.total}</p>
        <p>Estado: {pedido.estado}</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 underline">
          {" "}
          Volver al catalogo
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <p className="p-6">
        Carrito vacio.{" "}
        <Link to="/" className="text-violet-600 underline">
          Volver
        </Link>
      </p>
    );
  }
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Tu carrito</h1>

      {items.map((item) => (
        <div
          key={item.id}
          className="mb-2 flex items-center justify-between rounded border bg-white p-3"
        >
          <span>
            {item.nombre} x{item.cantidad} — ${item.precio * item.cantidad}
          </span>
          <button onClick={() => remove(item.id)} className="text-red-600">
            Quitar
          </button>
        </div>
      ))}

      <p className="mt-4 text-xl font-bold">Total estimado: ${total()}</p>

      <form onSubmit={enviarPedido} className="mt-6 grid gap-3">
        <label>
          Nombre
          <input
            required
            minLength={2}
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {enviando ? "Enviando pedido..." : "Crear pedido"}
        </button>
      </form>
    </main>
  );
}

// Funcion de Login tarjeta 3d
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUsuario({ email, password });
      setAuth(res.access_token, res.usuario);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  }

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4">
      {/* Destello de luz decorativo de fondo */}
      <div className="pointer-events-none absolute -top-20 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px]" />

      {/* Tarjeta 3D Flotante */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-500 hover:border-violet-500/30">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 border border-violet-500/20 text-2xl shadow-inner">
            🛒
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500 focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500 focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-violet-600/40 active:scale-[0.98]"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Pie de tarjeta */}
        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Aún no tienes una cuenta?{" "}
          <Link
            to="/registro"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegistro(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await registrarUsuario({ nombre, email, password });
      alert("¡Registro exitoso! Inicia sesión.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el registro");
    }
  }

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4">
      {/* Destello de luz decorativo de fondo */}
      <div className="pointer-events-none absolute -top-20 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px]" />

      {/* Tarjeta 3D Flotante */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-500 hover:border-violet-500/30">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 border border-violet-500/20 text-2xl shadow-inner">
            ✨
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Únete y comienza a comprar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegistro} className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nombre completo
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500 focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500 focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500 focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-violet-600/40 active:scale-[0.98]"
          >
            Registrarse
          </button>
        </form>

        {/* Pie de tarjeta */}
        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Product[]>([]);
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Diseño UX estado el modo de edicion rapida
  const [productoEditando, setProductoEditando] = useState<Product | null>(
    null,
  );
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevoStock, setNuevoStock] = useState("");
  const [unidadEditando, setUnidadEditando] = useState<"pza" | "kg">("pza");
  const [codigoBarrasEditando, setCodigoBarrasEditando] = useState("");

  // Formulario creación
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("tech");
  const [imagen, setImagen] = useState("📦");
  const [stock, setStock] = useState("10");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [unidadMedida, setUnidadMedida] = useState<"pza" | "kg">("pza");
  const [codigoBarras, setCodigoBarras] = useState("");

  const cargarPedidos = async () => {
    try {
      const data = await adminListarPedidos();
      setPedidos(data);
    } catch (err) {
      console.error("Error al cargar pedidos");
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await adminListarProductos();
      setProductos(data);
    } catch (err) {
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario?.rol === "admin") {
      cargarProductos();
      cargarPedidos();
    }
  }, [usuario]);

  if (!usuario || usuario.rol !== "admin") {
    return (
      <main className="p-6 text-red-600 font-bold">
        Acceso denegado. Se requiere cuenta de administrador.
      </main>
    );
  }

  async function handleCambioEstado(id: number, nuevoEstado: string) {
    try {
      await adminCambiarEstado(id, nuevoEstado);
      cargarPedidos();
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setMensaje("");
    setError("");
    try {
      await crearProductoAdmin({
        nombre,
        precio: Number(precio),
        categoria,
        imagen,
        stock: Number(stock),
        unidad_medida: unidadMedida,
        codigo_barras: codigoBarras.trim() || null,
        descripcion,
      });
      setMensaje("¡Producto creado con éxito!");
      setNombre("");
      setPrecio("");
      setDescripcion("");
      setUnidadMedida("pza");
      setCodigoBarras("");
      cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await adminEliminarProducto(id);
      cargarProductos();
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  function abrirModalEdicion(p: Product) {
    setProductoEditando(p);
    setNuevoPrecio(String(p.precio));
    setNuevoStock(String(p.stock));
    setUnidadEditando(p.unidad_medida ?? "pza");
    setCodigoBarrasEditando(p.codigo_barras ?? "");
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!productoEditando) return;

    try {
      await adminActualizarProducto(productoEditando.id, {
        precio: Number(nuevoPrecio),
        stock: Number(nuevoStock),
        unidad_medida: unidadEditando,
        codigo_barras: codigoBarrasEditando.trim() || null,
      });
      setProductoEditando(null);
      cargarProductos();
    } catch (err) {
      alert("Error al actualizar el producto");
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Panel de Administración</h1>

      {/* Formulario de creación */}
      <div className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Crear Nuevo Producto</h2>
        <form onSubmit={handleCrear} className="grid gap-3 sm:grid-cols-2">
          <label>
            Nombre{" "}
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            />
          </label>
          <label>
            Precio{" "}
            <input
              type="number"
              step="0.01"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            />
          </label>
          <label>
            Categoría
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            >
              <option value="tech">Tech</option>
              <option value="ropa">Ropa</option>
              <option value="hogar">Hogar</option>
            </select>
          </label>
          <label>
            Se vende por
            <select
              value={unidadMedida}
              onChange={(event) =>
                setUnidadMedida(event.target.value as "pza" | "kg")
              }
              className="block w-full rounded border px-3 py-2"
            >
              <option value="pza">Pieza</option>
              <option value="kg">Kilogramo</option>
            </select>
          </label>
          <label>
            Emoji / Imagen{" "}
            <input
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            />
          </label>
          <label>
            Stock{" "}
            <input
              type="number"
              min="0"
              step={unidadMedida === "kg" ? "0.001" : "1"}
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            />
          </label>
          <label>
            Código de barras (opcional)
            <input
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              className="block w-full rounded border px-3 py-2"
            />
          </label>
          <label>
            Descripción{" "}
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="block w-full rounded border px-3 py-2"
            />
          </label>

          <div className="sm:col-span-2">
            {mensaje && (
              <p className="text-green-600 font-semibold">{mensaje}</p>
            )}
            {error && <p className="text-red-600">{error}</p>}
            <button
              type="submit"
              className="mt-2 rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
            >
              Crear Producto
            </button>
          </div>
        </form>
      </div>

      {/* Listado de Pedidos */}
      <h2 className="mb-4 mt-10 text-xl font-bold">Gestión de Pedidos</h2>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-700 text-sm">
              <th className="p-3">ID</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Ítems</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((ped) => (
              <tr key={ped.id} className="border-b hover:bg-slate-50 text-sm">
                <td className="p-3 font-semibold">#{ped.id}</td>
                <td className="p-3">
                  <div>{ped.nombre_cliente}</div>
                  <div className="text-xs text-slate-500">
                    {ped.email_cliente}
                  </div>
                </td>
                <td className="p-3 font-bold">${ped.total}</td>
                <td className="p-3">
                  <select
                    value={ped.estado}
                    onChange={(e) => handleCambioEstado(ped.id, e.target.value)}
                    className="rounded border px-2 py-1 bg-white text-xs font-semibold"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {ped.items.map((i, idx) => (
                    <div key={idx}>
                      • {i.nombre_producto} (x{i.cantidad})
                    </div>
                  ))}
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No hay pedidos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Listado / Tabla */}
      <h2 className="mb-4 text-xl font-bold">Inventario de Productos</h2>
      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-700 text-sm">
                <th className="p-3">Ícono</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50 text-sm">
                  <td className="p-3 text-2xl">{p.imagen}</td>
                  <td className="p-3 font-semibold">{p.nombre}</td>
                  <td
                    className="p-3 cursor-pointer hover:text-violet-600 font-medium"
                    onClick={() => abrirModalEdicion(p)}
                  >
                    ${p.precio} ✏️
                  </td>
                  <td
                    className="p-3 cursor-pointer hover:text-violet-600 font-medium"
                    onClick={() => abrirModalEdicion(p)}
                  >
                    {p.stock} ✏️
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edición */}
      {productoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              Editar: {productoEditando.nombre}
            </h2>
            <form onSubmit={guardarEdicion} className="grid gap-3">
              <label>
                Precio ($)
                <input
                  type="number"
                  step="0.01"
                  required
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  className="block w-full rounded border px-3 py-2 mt-1"
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  required
                  value={nuevoStock}
                  onChange={(e) => setNuevoStock(e.target.value)}
                  className="block w-full rounded border px-3 py-2 mt-1"
                  step={unidadEditando === "kg" ? "0.001" : "1"}
                />
              </label>
              <label>
                Se vende por
                <select
                  value={unidadEditando}
                  onChange={(e) =>
                    setUnidadEditando(e.target.value as "pza" | "kg")
                  }
                  className="mt-1 block w-full rounded border px-3 py-2"
                >
                  <option value="pza">Pieza</option>
                  <option value="kg">Kilogramo</option>
                </select>
              </label>
              <label>
                Código de barras (opcional)
                <input
                  value={codigoBarrasEditando}
                  onChange={(e) => setCodigoBarrasEditando(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2"
                />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductoEditando(null)}
                  className="rounded border px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas protegidas (exigen login) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <POSTerminal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/producto/:id"
          element={
            <ProtectedRoute>
              <Detalle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
