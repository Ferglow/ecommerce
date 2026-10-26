import { useCallback, useEffect, useState } from 'react';
import { getProducto, getProductos } from '../lib/api';
import type { Product } from '../data/products';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_PRODUCTS: AsyncState<Product[]> = {
  data: null,
  loading: true,
  error: null,
};

const EMPTY_PRODUCT: AsyncState<Product> = {
  data: null,
  loading: true,
  error: null,
};

export function useProductos() {
  const [state, setState] = useState<AsyncState<Product[]>>(EMPTY_PRODUCTS);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getProductos(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      });

    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => {
    setState(EMPTY_PRODUCTS);
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, retry };
}

export function useProducto(id: number | undefined) {
  const [state, setState] = useState<AsyncState<Product>>(EMPTY_PRODUCT);
  const [reloadKey, setReloadKey] = useState(0);
  const invalidId = id === undefined || Number.isNaN(id);

  useEffect(() => {
    if (id === undefined || Number.isNaN(id)) return;

    const controller = new AbortController();

    getProducto(id, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const retry = useCallback(() => {
    setState(EMPTY_PRODUCT);
    setReloadKey((key) => key + 1);
  }, []);

  if (invalidId) {
    return {
      data: null,
      loading: false,
      error: 'Producto no encontrado',
      retry,
    };
  }

  return { ...state, retry };
}
