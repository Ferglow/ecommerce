import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "./data/products";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import { useProducto, useProductos } from "./hooks/useProducts";
import { useCart } from "./store/cartStore";
import { useAuth } from "./store/authStore";
import { useNavigate } from "react-router-dom";
import {
  crearPedido,
  type PedidoCreado,
  loginUsuario,
  registrarUsuario,
  crearProductoAdmin,
  adminListarProductos,
  adminActualizarProducto,
  adminEliminarProducto,
} from "./lib/api";

const CATEGORIAS = ["todas", "tech", "ropa", "hogar"] as const;
//Componentes
function Navbar() {
  const count = useCart((s) => s.count());
  const { usuario, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
      <Link to="/" className="text-xl font-bold">
        🛒 MiTienda
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="hover:text-violet-300">
          Catálogo
        </Link>
        {usuario?.rol === "admin" && (
          <Link to="/admin" className="hover:text-violet-300">
            Admin
          </Link>
        )}
        <Link to="/carrito" className="hover:text-violet-300">
          Carrito ({count})
        </Link>
        {usuario ? (
          <>
            <span className="text-sm text-violet-300">
              Hola, {usuario.nombre}
            </span>
            <button
              onClick={logout}
              className="rounded bg-red-600 px-3 py-1 text-xs"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-violet-300">
              Entrar
            </Link>
            <Link to="/registro" className="hover:text-violet-300">
              Registro
            </Link>
          </>
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

function Catalogo() {
  const add = useCart((s) => s.add);
  const { data: products, loading, error, retry } = useProductos();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] =
    useState<(typeof CATEGORIAS)[number]>("todas");

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Catálogo</h1>
        <Cargando mensaje="Cargando productos desde la API..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Catálogo</h1>
        <ErrorApi mensaje={error} onRetry={retry} />
      </main>
    );
  }

  const lista = products ?? [];
  const filtrados = lista.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoria === "todas" || p.categoria === categoria),
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Catálogo</h1>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto... ej: laptop"
          className="w-full rounded border px-4 py-2"
        />
        <div className="flex gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full px-4 py-2 text-sm ${
                categoria === c ? "bg-slate-900 text-white" : "border bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtrados.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-5xl">{p.imagen}</div>
            <Link
              to={`/producto/${p.id}`}
              className="mt-2 block font-semibold hover:text-violet-600"
            >
              {p.nombre}
            </Link>
            <p className="text-sm text-slate-500">
              {p.descripcion} · stock: {p.stock}
            </p>
            <p className="mt-1 text-lg font-bold">${p.precio}</p>
            <button
              onClick={() => add(p)}
              className="mt-3 w-full rounded bg-violet-600 py-2 text-white hover:bg-violet-700"
            >
              Añadir
            </button>
          </div>
        ))}
      </div>
      {filtrados.length === 0 && (
        <p className="mt-6">
          Sin resultados para "{busqueda}" en {categoria}
        </p>
      )}
    </main>
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
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar Sesión</h1>
      <form onSubmit={handleLogin} className="grid gap-3">
        <label>
          Email{" "}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>
        <label>
          Contraseña{" "}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded bg-violet-600 px-4 py-2 text-white"
        >
          Entrar
        </button>
      </form>
    </main>
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
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Crear Cuenta</h1>
      <form onSubmit={handleRegistro} className="grid gap-3">
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
          Email{" "}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>
        <label>
          Contraseña (mín. 8 caracteres){" "}
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded border px-3 py-2"
          />
        </label>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded bg-violet-600 px-4 py-2 text-white"
        >
          Registrarse
        </button>
      </form>
    </main>
  );
}

function AdminPanel() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Formulario creación
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('tech');
  const [imagen, setImagen] = useState('📦');
  const [stock, setStock] = useState('10');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await adminListarProductos();
      setProductos(data);
    } catch (err) {
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario?.rol === 'admin') {
      cargarProductos();
    }
  }, [usuario]);

  if (!usuario || usuario.rol !== 'admin') {
    return <main className="p-6 text-red-600 font-bold">Acceso denegado. Se requiere cuenta de administrador.</main>;
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await crearProductoAdmin({
        nombre,
        precio: Number(precio),
        categoria,
        imagen,
        stock: Number(stock),
        descripcion,
      });
      setMensaje('¡Producto creado con éxito!');
      setNombre('');
      setPrecio('');
      setDescripcion('');
      cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await adminEliminarProducto(id);
      cargarProductos();
    } catch (err) {
      alert('Error al eliminar');
    }
  }

  async function handleCambioRapido(id: number, campo: string, valorActual: any) {
    const nuevoValor = prompt(`Actualizar ${campo}:`, String(valorActual));
    if (nuevoValor === null) return;
    
    try {
      const payload = campo === 'precio' || campo === 'stock' ? Number(nuevoValor) : nuevoValor;
      await adminActualizarProducto(id, { [campo]: payload });
      cargarProductos();
    } catch (err) {
      alert('Error al actualizar');
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Panel de Administración</h1>

      {/* Formulario de creación */}
      <div className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Crear Nuevo Producto</h2>
        <form onSubmit={handleCrear} className="grid gap-3 sm:grid-cols-2">
          <label>Nombre <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="block w-full rounded border px-3 py-2" /></label>
          <label>Precio <input type="number" step="0.01" required value={precio} onChange={(e) => setPrecio(e.target.value)} className="block w-full rounded border px-3 py-2" /></label>
          <label>Categoría 
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="block w-full rounded border px-3 py-2">
              <option value="tech">Tech</option>
              <option value="ropa">Ropa</option>
              <option value="hogar">Hogar</option>
            </select>
          </label>
          <label>Emoji / Imagen <input value={imagen} onChange={(e) => setImagen(e.target.value)} className="block w-full rounded border px-3 py-2" /></label>
          <label>Stock <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="block w-full rounded border px-3 py-2" /></label>
          <label>Descripción <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="block w-full rounded border px-3 py-2" /></label>

          <div className="sm:col-span-2">
            {mensaje && <p className="text-green-600 font-semibold">{mensaje}</p>}
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit" className="mt-2 rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700">Crear Producto</button>
          </div>
        </form>
      </div>

      {/* Listado / Tabla */}
      <h2 className="mb-4 text-xl font-bold">Inventario de Productos</h2>
      {loading ? <p>Cargando inventario...</p> : (
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
                  <td className="p-3 cursor-pointer hover:text-violet-600" onClick={() => handleCambioRapido(p.id, 'precio', p.precio)}>
                    ${p.precio} ✏️
                  </td>
                  <td className="p-3 cursor-pointer hover:text-violet-600" onClick={() => handleCambioRapido(p.id, 'stock', p.stock)}>
                    {p.stock} ✏️
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEliminar(p.id)} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 text-xs">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<Detalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
