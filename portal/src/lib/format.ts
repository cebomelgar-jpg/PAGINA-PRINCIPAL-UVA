import type {
  FulfillmentMethod,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
} from "./types";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatARS(value: number) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatOrderNumber(orderNumber: number) {
  return `#${String(orderNumber).padStart(5, "0")}`;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  flores: "Flores secas",
  rosin_hash: "Rosin Hash",
  vapes: "Vapes",
};

export const CATEGORY_DESCRIPTIONS: Record<ProductCategory, string> = {
  flores: "Genéticas seleccionadas con perfil de cannabinoides y aromas.",
  rosin_hash: "Extracciones sin solventes, de alta pureza.",
  vapes: "Formatos de vaporización para acompañar tu tratamiento.",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia bancaria",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  cancelled: "Cancelado",
};

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup: "Retiro en sede",
  delivery: "Envío / entrega",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-300/70 bg-amber-50 text-amber-800",
  confirmed: "border-sky-300/70 bg-sky-50 text-sky-800",
  preparing: "border-purple-300/70 bg-purple-50 text-purple-800",
  delivered: "border-emerald-300/70 bg-emerald-50 text-emerald-800",
  cancelled: "border-rose-300/70 bg-rose-50 text-rose-800",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "border-amber-300/70 bg-amber-50 text-amber-800",
  paid: "border-emerald-300/70 bg-emerald-50 text-emerald-800",
  cancelled: "border-rose-300/70 bg-rose-50 text-rose-800",
};
