import { useState, type FormEvent } from "react";
import type { Product } from "../data/products";
import { useProductos } from "../hooks/useProducts";
import { useCart } from "../store/cartStore";
import { buscarPorCodigoBarras, crearPedido,
  type PedidoCreado } from "../lib/api";


export function POSTerminal() {
  const { data: productos, loading, error, retry} = useProductos();
  const { items, add, remove, setCantidad, clear, total } = useCart();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [mensaje, setMensaje] = useState("");
  const [productoPesando, setProductoPesando] = useState<Product | null>(null);
  const [modoPesaje, setModoPesaje] = useState<"peso" | "monto">("peso");
  const [entradaPesaje, setEntradaPesaje] = useState("");
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta">("efectivo");
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const [errorCobro, setErrorCobro] = useState("");
  const [cobrando, setCobrando] = useState(false);
  const [ventaCreada, setVentaCreada] = useState<PedidoCreado | null>(null);

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
      setMensaje(
        err instanceof Error ? err.message : "No se encontró el código.",
      );
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

  async function finalizarVenta() {
  setErrorCobro("");

  if (items.length === 0) {
    setErrorCobro("El ticket está vacío.");
    return;
  }

  const totalVenta = total();
  const recibido = Number(efectivoRecibido);

  if (metodoPago === "efectivo" && (!Number.isFinite(recibido) || recibido < totalVenta)) {
    setErrorCobro("El efectivo recibido no cubre el total.");
    return;
  }

  setCobrando(true);

  try {
    const venta = await crearPedido({
      nombre_cliente: "Público general",
      email_cliente: "mostrador@example.com",
      metodo_pago: metodoPago,
      items: items.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
      })),
    });

    setVentaCreada(venta);
    setCobroAbierto(false);
    clear();
    retry();
  } catch (err) {
    setErrorCobro(err instanceof Error ? err.message : "No se pudo registrar la venta.");
  } finally {
    setCobrando(false);
  }
}

  if (loading)
    return <main className="pos-page min-h-[calc(100vh-72px)] p-8">Cargando productos…</main>;
  if (error) return <main className="pos-page min-h-[calc(100vh-72px)] p-8 text-red-500">{error}</main>;

  return (
    <main className="pos-page grid min-h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="min-w-0 p-5 lg:p-8">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            Terminal de ventas
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Nueva venta
          </h1>
        </header>

        <form onSubmit={buscarCodigo} className="mb-5">
          <input
            autoFocus
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Busca un producto o escanea su código de barras"
            aria-label="Buscar producto o escanear código de barras"
            className="pos-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          {categorias.map((nombre) => (
            <button
              key={nombre}
              onClick={() => setCategoria(nombre)}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                categoria === nombre
                  ? "border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                  : "pos-subtle-button hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300"
              }`}
            >
              {nombre === "todas" ? "Todos" : nombre.replace("_", " ")}
            </button>
          ))}
        </div>

        {mensaje && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200"
          >
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
                className="pos-card group flex min-h-52 flex-col rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="pos-card-media mb-4 flex h-24 items-center justify-center rounded-xl text-5xl">
                  {producto.imagen}
                </span>
                <span className="block font-semibold text-slate-900 dark:text-slate-100">{producto.nombre}</span>
                <span className="mt-1 block text-lg font-semibold text-violet-700 dark:text-violet-300">
                  ${producto.precio.toFixed(2)} <span className="text-xs font-medium text-slate-500">/ {producto.unidad_medida ?? "pza"}</span>
                </span>
                <span className="pos-muted mt-auto pt-3 text-xs">
                  Stock: {producto.stock} {producto.unidad_medida ?? "pza"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="pos-panel flex min-h-[420px] flex-col border-t p-5 shadow-[-12px_0_32px_-28px_rgba(15,23,42,0.3)] lg:border-l lg:border-t-0 lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="pos-muted text-xs font-semibold uppercase tracking-widest">
              Ticket actual
            </p>
            <h2 className="mt-1 text-xl font-semibold">Venta de mostrador</h2>
          </div>
          <span className="pos-subtle-button rounded-full border px-3 py-1 text-sm">
            {items.length} líneas
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {items.length === 0 ? (
            <p className="pos-empty rounded-xl border border-dashed p-6 text-center text-sm">
              Escanea o selecciona productos para iniciar una venta.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="pos-card rounded-xl border p-3"
              >
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{item.nombre}</span>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Quitar ${item.nombre}`}
                    className="pos-muted rounded-md px-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setCantidad(
                          item.id,
                          item.cantidad -
                            (item.unidad_medida === "kg" ? 0.1 : 1),
                        )
                      }
                      className="pos-subtle-button h-8 w-8 rounded-lg border font-semibold transition hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      −
                    </button>
                    <span>
                      {item.unidad_medida === "kg"
                        ? item.cantidad.toFixed(3)
                        : item.cantidad}{" "}
                      {item.unidad_medida}
                    </span>
                    <button
                      onClick={() =>
                        setCantidad(
                          item.id,
                          item.cantidad +
                            (item.unidad_medida === "kg" ? 0.1 : 1),
                        )
                      }
                      className="pos-subtle-button h-8 w-8 rounded-lg border font-semibold transition hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300"
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

        <div className="mt-5 border-t pos-divider pt-5">
          <div className="pos-muted flex justify-between">
            <span>Subtotal</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <div className="mt-4 flex justify-between text-2xl font-semibold">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={() => {
              setErrorCobro("");
              setMetodoPago("efectivo");
              setEfectivoRecibido("");
              setCobroAbierto(true);
}}
            className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-4 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar al cobro
          </button>
          <button
            disabled={items.length === 0}
            onClick={clear}
            className="pos-muted mt-2 w-full rounded-xl px-4 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40"
          >
            Vaciar ticket
          </button>
        </div>
      </aside>

      {ventaCreada && (
  <div className="pos-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" className="pos-modal w-full max-w-md rounded-2xl border p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-emerald-400">Venta completada</p>
      <h2 className="mt-2 text-3xl font-semibold">Ticket #{ventaCreada.id}</h2>
      <p className="pos-muted mt-4">Total: ${ventaCreada.total}</p>
      <p className="pos-muted mt-1 capitalize">Pago: {ventaCreada.metodo_pago}</p>
      <button
        onClick={() => setVentaCreada(null)}
        className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white"
      >
        Nueva venta
      </button>
    </section>
  </div>
)}

      {productoPesando && (
        <div className="pos-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pesaje-titulo"
            className="pos-modal w-full max-w-md rounded-2xl border p-6"
          >
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {productoPesando.imagen} {productoPesando.nombre}
            </p>
            <h2 id="pesaje-titulo" className="mt-1 text-2xl font-semibold">
              ${productoPesando.precio.toFixed(2)} / kg
            </h2>

            <div className="pos-segmented mt-6 grid grid-cols-2 gap-2 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setModoPesaje("peso");
                  setEntradaPesaje("");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  modoPesaje === "peso"
                    ? "bg-violet-600 text-white"
                    : "pos-muted hover:text-violet-700 dark:hover:text-violet-300"
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
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  modoPesaje === "monto"
                    ? "bg-violet-600 text-white"
                    : "pos-muted hover:text-violet-700 dark:hover:text-violet-300"
                }`}
              >
                Ingresar importe
              </button>
            </div>

            <form onSubmit={confirmarPesaje} className="mt-5">
              <label className="text-sm text-slate-700 dark:text-slate-300">
                {modoPesaje === "peso"
                  ? "Peso en kilogramos"
                  : "Importe en dinero"}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    type="number"
                    min="0.001"
                    step={modoPesaje === "peso" ? "0.001" : "0.01"}
                    required
                    value={entradaPesaje}
                    onChange={(event) => setEntradaPesaje(event.target.value)}
                    placeholder={
                      modoPesaje === "peso" ? "Ej. 1.250" : "Ej. 20.00"
                    }
                    className="pos-input w-full rounded-xl border px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                  <span className="pos-muted text-sm">
                    {modoPesaje === "peso" ? "kg" : "$"}
                  </span>
                </div>
              </label>

              {entradaPesaje && Number(entradaPesaje) > 0 && (
                <p className="pos-card mt-4 rounded-xl border p-4 text-sm">
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

              {mensaje && (
                <p role="status" className="mt-3 text-sm text-amber-300">
                  {mensaje}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProductoPesando(null);
                    setEntradaPesaje("");
                    setMensaje("");
                  }}
                  className="pos-muted rounded-xl px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
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

      {cobroAbierto && (
  <div className="pos-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="cobro-titulo"
      className="pos-modal w-full max-w-md rounded-2xl border p-6"
    >
      <p className="pos-muted text-sm font-semibold uppercase tracking-widest">Total a cobrar</p>
      <h2 id="cobro-titulo" className="mt-1 text-4xl font-semibold">
        ${total().toFixed(2)}
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {(["efectivo", "tarjeta"] as const).map((metodo) => (
          <button
            key={metodo}
            type="button"
            onClick={() => {
              setMetodoPago(metodo);
              setErrorCobro("");
            }}
            className={`rounded-xl border px-4 py-3 capitalize ${
              metodoPago === metodo
                ? "border-violet-400 bg-violet-500/15 text-white"
                : "pos-subtle-button border"
            }`}
          >
            {metodo === "efectivo" ? "💵 Efectivo" : "💳 Tarjeta"}
          </button>
        ))}
      </div>

      {metodoPago === "efectivo" ? (
        <div className="mt-5">
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Efectivo recibido
            <input
              autoFocus
              type="number"
              min={total()}
              step="0.01"
              value={efectivoRecibido}
              onChange={(event) => setEfectivoRecibido(event.target.value)}
              className="pos-input mt-2 w-full rounded-xl border px-4 py-3 text-xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              placeholder="0.00"
            />
          </label>
          {Number(efectivoRecibido) >= total() && (
            <p className="mt-3 text-lg text-emerald-400">
              Cambio: ${(Number(efectivoRecibido) - total()).toFixed(2)}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
          Pago con tarjeta simulado; no se realizará ningún cargo bancario.
        </p>
      )}

      {errorCobro && (
        <p role="alert" className="mt-4 text-sm text-red-400">{errorCobro}</p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={cobrando}
          onClick={() => setCobroAbierto(false)}
          className="pos-subtle-button flex-1 rounded-xl border px-4 py-3 transition hover:border-slate-400"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={
            cobrando ||
            (metodoPago === "efectivo" && Number(efectivoRecibido) < total())
          }
          onClick={finalizarVenta}
          className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          {cobrando ? "Procesando…" : "Confirmar venta"}
        </button>
      </div>
    </section>
  </div>
)}
    </main>
  );
}
