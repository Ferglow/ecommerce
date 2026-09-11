import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { products } from './data/products';
import { useCart } from './store/cartStore';

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
  const filtrados = products.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Catálogo</h1>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto... ej: laptop"
        className="mb-6 w-full rounded border px-4 py-2"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtrados.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-5xl">{p.imagen}</div>
            <h2 className="mt-2 font-semibold">{p.nombre}</h2>
            <p className="text-sm text-slate-500">{p.descripcion}</p>
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
      {filtrados.length === 0 && <p className="mt-6">Sin resultados para "{busqueda}"</p>}
    </main>
  );
}

function Carrito() {
  const { items, total, remove, clear } = useCart();
  const totalValor = useCart((s) => s.total)();

  if (items.length === 0) return <p className="p-6">Carrito vacío. <Link to="/" className="text-violet-600 underline">Volver</Link></p>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Tu carrito</h1>
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
        <Route path="/carrito" element={<Carrito />} />
      </Routes>
    </BrowserRouter>
  );
}
