import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../data/products";
import { useProductos } from "../hooks/useProducts";
import { useCart } from "../store/cartStore";
import { buscarPorCodigoBarras } from "../lib/api";

export function POSTerminal() {
  const { data: productos, loading, error } = useProductos();
  const { items, add, remove, setCantidad, clear, total } = useCart();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const [productoPesando, setProductoPesando] = useState<Product | null>(null);
  const [modoPesaje, setModoPesaje] = useState<"peso" | "monto">("peso");
  const [entradaPesaje, setEntradaPesaje] = useState("");

  const categorias = [
    "todas",
    ...new Set((productos ?? []).map((producto) => producto.categoria)),
  ];

  const filtrados = (productos ?? []).filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoria === "todas" || producto.categoria === categoria),
  );

  function agregarProducto(producto: Product) {
    const unidad = producto.unidad_medida ?? "pza";

    if (unidad === "kg") {
  setProductoPesando(producto);
  setModoPesaje("peso");
  setEntradaPesaje("");
  setMensaje("");
  return;
}

    const enTicket = items.find((item) => item.id === producto.id);
    if ((enTicket?.cantidad ?? 0) >= producto.stock) {
      setMensaje(`Stock insuficiente de ${producto.nombre}.`);
      return;
    }

    add(producto);
    setMensaje(`${producto.nombre} añadido al ticket.`);
  }

  async function buscarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const codigo = busqueda.trim();
    if (!codigo) return;

    try {
      const producto = await buscarPorCodigoBarras(codigo);
      agregarProducto(producto);
      setBusqueda("");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se encontró el código.");
    }
  }

  function confirmarPesaje(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!productoPesando) return;

  const valor = Number(entradaPesaje);
  if (!Number.isFinite(valor) || valor <= 0) {
    setMensaje("Ingresa un valor mayor que cero.");
    return;
  }

  const cantidad =
    modoPesaje === "peso"
      ? Number(valor.toFixed(3))
      : Number((valor / productoPesando.precio).toFixed(3));

  const cantidadEnTicket =
    items.find((item) => item.id === productoPesando.id)?.cantidad ?? 0;

  if (cantidad <= 0) {
    setMensaje("El valor es demasiado pequeño para registrar.");
    return;
  }

  if (cantidadEnTicket + cantidad > productoPesando.stock) {
    setMensaje(`Stock insuficiente de ${productoPesando.nombre}.`);
    return;
  }

  add(productoPesando, cantidad);
  setMensaje(
    `${cantidad.toFixed(3)} kg de ${productoPesando.nombre} añadido al ticket.`,
  );
  setProductoPesando(null);
  setEntradaPesaje("");
}

  if (loading) return <main className="p-8 text-slate-300">Cargando productos…</main>;
  if (error) return <main className="p-8 text-red-400">{error}</main>;

  return (
    <main className="grid min-h-[calc(100vh-72px)] grid-cols-1 bg-slate-950 text-slate-100 lg:grid-cols-[1fr_380px]">
      <section className="min-w-0 p-5 lg:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
            Punto de venta
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Nueva venta</h1>
        </header>

        <form onSubmit={buscarCodigo} className="mb-5">
          <input
            autoFocus
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Busca un producto o escanea su código de barras"
            aria-label="Buscar producto o escanear código de barras"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          {categorias.map((nombre) => (
            <button
              key={nombre}
              onClick={() => setCategoria(nombre)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                categoria === nombre
                  ? "border-violet-400 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {nombre === "todas" ? "Todos" : nombre.replace("_", " ")}
            </button>
          ))}
        </div>

        {mensaje && (
          <p role="status" className="mb-4 rounded-lg border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
            {mensaje}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((producto) => {
            const sinStock = producto.stock <= 0;

            return (
              <button
                key={producto.id}
                disabled={sinStock}
                onClick={() => agregarProducto(producto)}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="mb-5 flex h-20 items-center justify-center rounded-xl bg-slate-900 text-5xl">
                  {producto.imagen}
                </span>
                <span className="block font-medium">{producto.nombre}</span>
                <span className="mt-1 block text-sm text-slate-400">
                  ${producto.precio} / {producto.unidad_medida ?? "pza"}
                </span>
                <span className="mt-3 block text-xs text-slate-500">
                  Stock: {producto.stock} {producto.unidad_medida ?? "pza"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="flex min-h-[420px] flex-col border-t border-white/10 bg-slate-900/70 p-5 lg:border-l lg:border-t-0 lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Ticket actual</p>
            <h2 className="mt-1 text-xl font-semibold">Venta</h2>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-400">
            {items.length} productos
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
              Escanea o selecciona productos para iniciar una venta.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{item.nombre}</span>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Quitar ${item.nombre}`}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCantidad(item.id, item.cantidad - (item.unidad_medida === "kg" ? 0.1 : 1))}
                      className="h-7 w-7 rounded-lg border border-white/10 hover:bg-white/10"
                    >
                      −
                    </button>
                    <span>
                      {item.unidad_medida === "kg" ? item.cantidad.toFixed(3) : item.cantidad} {item.unidad_medida}
                    </span>
                    <button
                      onClick={() => setCantidad(item.id, item.cantidad + (item.unidad_medida === "kg" ? 0.1 : 1))}
                      className="h-7 w-7 rounded-lg border border-white/10 hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <div className="mt-4 flex justify-between text-2xl font-semibold">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={() => navigate("/carrito")}
            className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-4 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar al cobro
          </button>
          <button
            disabled={items.length === 0}
            onClick={clear}
            className="mt-2 w-full rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5 disabled:opacity-40"
          >
            Vaciar ticket
          </button>
        </div>
      </aside>

      {productoPesando && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="pesaje-titulo"
      className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
    >
      <p className="text-sm text-violet-300">
        {productoPesando.imagen} {productoPesando.nombre}
      </p>
      <h2 id="pesaje-titulo" className="mt-1 text-2xl font-semibold">
        ${productoPesando.precio.toFixed(2)} / kg
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => {
            setModoPesaje("peso");
            setEntradaPesaje("");
          }}
          className={`rounded-lg px-3 py-2 text-sm ${
            modoPesaje === "peso"
              ? "bg-violet-600 text-white"
              : "text-slate-400"
          }`}
        >
          Ingresar peso
        </button>
        <button
          type="button"
          onClick={() => {
            setModoPesaje("monto");
            setEntradaPesaje("");
          }}
          className={`rounded-lg px-3 py-2 text-sm ${
            modoPesaje === "monto"
              ? "bg-violet-600 text-white"
              : "text-slate-400"
          }`}
        >
          Ingresar importe
        </button>
      </div>

      <form onSubmit={confirmarPesaje} className="mt-5">
        <label className="text-sm text-slate-300">
          {modoPesaje === "peso" ? "Peso en kilogramos" : "Importe en dinero"}
          <div className="mt-2 flex items-center gap-2">
            <input
              autoFocus
              type="number"
              min="0.001"
              step={modoPesaje === "peso" ? "0.001" : "0.01"}
              required
              value={entradaPesaje}
              onChange={(event) => setEntradaPesaje(event.target.value)}
              placeholder={modoPesaje === "peso" ? "Ej. 1.250" : "Ej. 20.00"}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
            />
            <span className="text-sm text-slate-400">
              {modoPesaje === "peso" ? "kg" : "$"}
            </span>
          </div>
        </label>

        {entradaPesaje && Number(entradaPesaje) > 0 && (
          <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm text-slate-300">
            {modoPesaje === "peso"
              ? `${Number(entradaPesaje).toFixed(3)} kg`
              : `${(Number(entradaPesaje) / productoPesando.precio).toFixed(3)} kg`}
            {" × $"}
            {productoPesando.precio.toFixed(2)}
            {" / kg = $"}
            {(modoPesaje === "peso"
              ? Number(entradaPesaje) * productoPesando.precio
              : Number(entradaPesaje)
            ).toFixed(2)}
          </p>
        )}

        {mensaje && <p role="status" className="mt-3 text-sm text-amber-300">{mensaje}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setProductoPesando(null);
              setEntradaPesaje("");
              setMensaje("");
            }}
            className="rounded-xl px-4 py-2 text-slate-300 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500"
          >
            Agregar al ticket
          </button>
        </div>
      </form>
    </section>
  </div>
)}
    </main>
  );
}