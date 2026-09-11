import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { products } from './data/products';
import { useCart } from './store/cartStore';

const CATEGORIAS = ['todas', 'tech', 'ropa', 'hogar'] as const;

function Navbar() {
  const count = useCart((s) => s.count());
  return (
    <nav className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
      <Link to="/" className="text-xl font-bold">🛒 MiTienda</Link>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-violet-300">Catálogo</Link>
        <Link to="/carrito" className="hover:text-violet-300">
          Carrito ({count})
        </Link>
      </div>
    </nav>
  );
}

function Catalogo() {
  const add = useCart((s) => s.add);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>('todas');

  const filtrados = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoria === 'todas' || p.categoria === categoria)
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
                categoria === c ? 'bg-slate-900 text-white' : 'border bg-white'
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
            <Link to={`/producto/${p.id}`} className="mt-2 block font-semibold hover:text-violet-600">
              {p.nombre}
            </Link>
            <p className="text-sm text-slate-500">{p.descripcion} · stock: {p.stock}</p>
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
      {filtrados.length === 0 && <p className="mt-6">Sin resultados para "{busqueda}" en {categoria}</p>}
    </main>
  );
}

function Detalle() {
  const { id } = useParams();
  const add = useCart((s) => s.add);
  const p = products.find((x) => x.id === Number(id));

  if (!p) return <p className="p-6">Producto no encontrado. <Link to="/" className="underline">Volver</Link></p>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-violet-600 underline">← Volver al catálogo</Link>
      <div className="mt-4 rounded-xl border bg-white p-6">
        <div className="text-7xl">{p.imagen}</div>
        <h1 className="mt-2 text-3xl font-bold">{p.nombre}</h1>
        <p className="text-slate-500">{p.categoria} · stock: {p.stock}</p>
        <p className="mt-2">{p.descripcion}</p>
        <p className="mt-3 text-2xl font-bold">${p.precio}</p>
        <button onClick={() => add(p)} className="mt-4 rounded bg-violet-600 px-6 py-2 text-white">
          Añadir al carrito
        </button>
      </div>
    </main>
  );
}

function Carrito() {
  const { items, total, remove, clear } = useCart();
  const totalValor = useCart((s) => s.total)();

  if (items.length === 0) return <p className="p-6">Carrito vacío. <Link to="/" className="text-violet-600 underline">Volver</Link></p>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Tu carrito (se guarda solo)</h1>
      {items.map((i) => (
        <div key={i.id} className="mb-2 flex items-center justify-between rounded border bg-white p-3">
          <span>{i.nombre} x{i.cantidad} — ${i.precio * i.cantidad}</span>
          <button onClick={() => remove(i.id)} className="text-red-600">Quitar</button>
        </div>
      ))}
      <p className="mt-4 text-xl font-bold">Total: ${totalValor}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={clear} className="rounded border px-4 py-2">Vaciar</button>
        <button onClick={() => alert(`Pedido simulado por $${total()}`)} className="rounded bg-green-600 px-4 py-2 text-white">
          Checkout simulado
        </button>
      </div>
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
      </Routes>
    </BrowserRouter>
  );
}
