"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";
import { useToast } from "@/components/providers/toast-provider";

const STORAGE_KEY = "uva-portal-cart-v1";

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function sanitizeItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<CartItem>;
  if (
    typeof item.productId !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.name !== "string" ||
    typeof item.price !== "number" ||
    typeof item.stock !== "number" ||
    typeof item.quantity !== "number" ||
    !["flores", "rosin_hash", "vapes"].includes(item.category ?? "")
  ) {
    return null;
  }

  return {
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    price: item.price,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    category: item.category!,
    stock: item.stock,
    quantity: Math.max(1, Math.min(item.quantity, item.stock, 99)),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .map(sanitizeItem)
              .filter((item): item is CartItem => Boolean(item)),
          );
        }
      }
    } catch {
      // Un carrito corrupto no debe bloquear el portal.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage puede estar bloqueado; el carrito sigue en memoria.
    }
  }, [items, ready]);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      if (!product.active || product.stock <= 0) {
        toast({
          title: "Producto sin stock",
          description: "Consultá por WhatsApp o elegí otra opción del catálogo.",
          variant: "info",
        });
        return false;
      }

      if (product.price <= 0) {
        toast({
          title: "Precio a confirmar",
          description: "Este producto todavía no tiene precio publicado.",
          variant: "info",
        });
        return false;
      }

      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  price: product.price,
                  stock: product.stock,
                  quantity: Math.min(
                    item.quantity + quantity,
                    product.stock,
                    99,
                  ),
                }
              : item,
          );
        }

        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url,
            category: product.category,
            stock: product.stock,
            quantity: Math.min(quantity, product.stock, 99),
          },
        ];
      });

      toast({
        title: "Agregado al carrito",
        description: product.name,
      });
      return true;
    },
    [toast],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.productId !== productId) return item;
          if (quantity <= 0) return null;
          return {
            ...item,
            quantity: Math.min(quantity, item.stock, 99),
          };
        })
        .filter((item): item is CartItem => Boolean(item)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, ready, totalItems, subtotal, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }
  return context;
}
