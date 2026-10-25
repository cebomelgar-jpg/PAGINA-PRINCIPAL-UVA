import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAnalyticsRange, getBucketKey, buildAnalyticsBuckets } from "@/lib/dates";
import type {
  AdminOrder,
  AnalyticsData,
  AnalyticsRange,
  Order,
  OrderItem,
  OrderStatus,
  OrderWithItems,
  PaymentMethod,
  Product,
  ProductCategory,
} from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "bank_transfer"];
const CATEGORIES: ProductCategory[] = ["flores", "rosin_hash", "vapes"];

function logAndThrow(message: string, error: { message?: string } | null) {
  console.error(`[data] ${message}`, error?.message);
  throw new Error(message);
}

export async function getActiveProducts(category?: ProductCategory) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) logAndThrow("No pudimos cargar el catálogo.", error);
  return (data ?? []) as Product[];
}

export async function getAllProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) logAndThrow("No pudimos cargar el catálogo.", error);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) logAndThrow("No pudimos cargar el producto.", error);
  return (data as Product | null) ?? null;
}

export async function getPatientOrders(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) logAndThrow("No pudimos cargar tus pedidos.", error);
  return (data ?? []) as OrderWithItems[];
}

export async function getPatientOrder(orderId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) logAndThrow("No pudimos cargar el pedido.", error);
  return (data as OrderWithItems | null) ?? null;
}

export async function getAdminOrders(limit = 1000) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, phone), items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) logAndThrow("No pudimos cargar los pedidos.", error);
  return (data ?? []) as AdminOrder[];
}

export async function getAdminOrder(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, phone), items:order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) logAndThrow("No pudimos cargar el pedido.", error);
  return (data as AdminOrder | null) ?? null;
}

async function getOrdersInRange(range: AnalyticsRange) {
  const supabase = await createClient();
  const { start, end } = getAnalyticsRange(range);
  const pageSize = 1000;
  const rows: Array<
    Pick<
      Order,
      "id" | "user_id" | "patient_name" | "status" | "payment_method" | "total" | "created_at"
    > & { items: Array<Pick<OrderItem, "product_name" | "category" | "quantity" | "line_total">> | null }
  > = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, patient_name, status, payment_method, total, created_at, items:order_items(product_name, category, quantity, line_total)",
      )
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) logAndThrow("No pudimos cargar las analíticas.", error);
    rows.push(...((data ?? []) as typeof rows));
    if (!data || data.length < pageSize) break;
  }

  return { rows, start, end };
}

export async function getAdminAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
  const { rows, start, end } = await getOrdersInRange(range);
  const rangeInfo = getAnalyticsRange(range);
  const buckets = buildAnalyticsBuckets(range);
  const bucketMap = new Map(
    buckets.map((bucket) => [bucket.key, { ...bucket, orders: 0, revenue: 0 }]),
  );

  const statusMap = new Map(
    ORDER_STATUSES.map((status) => [status, { status, count: 0, total: 0 }]),
  );
  const paymentMap = new Map(
    PAYMENT_METHODS.map((method) => [method, { method, count: 0, total: 0 }]),
  );
  const productMap = new Map<
    string,
    { name: string; category: ProductCategory | null; quantity: number; revenue: number }
  >();
  const categoryMap = new Map(
    CATEGORIES.map((category) => [category, { category, quantity: 0, revenue: 0 }]),
  );
  const patients = new Set<string>();

  let revenue = 0;
  let validOrders = 0;
  let pending = 0;
  let cancelled = 0;

  for (const order of rows) {
    const total = Number(order.total);
    const status = order.status as OrderStatus;
    const statusEntry = statusMap.get(status);
    if (statusEntry) {
      statusEntry.count += 1;
      statusEntry.total += total;
    }

    if (status === "pending") pending += 1;
    if (status === "cancelled") {
      cancelled += 1;
      continue;
    }

    revenue += total;
    validOrders += 1;
    patients.add(order.user_id ?? order.patient_name);

    const paymentEntry = paymentMap.get(order.payment_method as PaymentMethod);
    if (paymentEntry) {
      paymentEntry.count += 1;
      paymentEntry.total += total;
    }

    const bucketKey = getBucketKey(new Date(order.created_at), range);
    const bucket = bucketMap.get(bucketKey);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += total;
    }

    for (const item of order.items ?? []) {
      const quantity = Number(item.quantity);
      const itemRevenue = Number(item.line_total);
      const key = `${item.product_name}::${item.category ?? ""}`;
      const current = productMap.get(key) ?? {
        name: item.product_name,
        category: (item.category as ProductCategory | null) ?? null,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += quantity;
      current.revenue += itemRevenue;
      productMap.set(key, current);

      if (item.category && categoryMap.has(item.category as ProductCategory)) {
        const categoryEntry = categoryMap.get(item.category as ProductCategory)!;
        categoryEntry.quantity += quantity;
        categoryEntry.revenue += itemRevenue;
      }
    }
  }

  return {
    range,
    rangeLabel: rangeInfo.label,
    start: start.toISOString(),
    end: end.toISOString(),
    metrics: {
      revenue,
      orders: validOrders,
      averageTicket: validOrders ? revenue / validOrders : 0,
      patients: patients.size,
      pending,
      cancelled,
    },
    buckets: [...bucketMap.values()],
    statusBreakdown: [...statusMap.values()],
    paymentBreakdown: [...paymentMap.values()],
    topProducts: [...productMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8),
    categoryBreakdown: [...categoryMap.values()],
  };
}

export async function getAdminOverview() {
  const supabase = await createClient();
  const monthStart = getAnalyticsRange("mes").start.toISOString();

  const [recentResult, pendingResult, monthResult, patientsResult, lowStockResult, activeResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, patient_name, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("orders")
        .select("total, status")
        .gte("created_at", monthStart),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "patient"),
      supabase
        .from("products")
        .select("id, name, stock, category, active")
        .eq("active", true)
        .order("stock", { ascending: true })
        .limit(5),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]);

  const firstError =
    recentResult.error ||
    pendingResult.error ||
    monthResult.error ||
    patientsResult.error ||
    lowStockResult.error ||
    activeResult.error;

  if (firstError) logAndThrow("No pudimos cargar el resumen.", firstError);

  const monthOrders = (monthResult.data ?? []) as Array<Pick<Order, "total" | "status">>;
  const monthRevenue = monthOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0);

  return {
    recentOrders: (recentResult.data ?? []) as Array<
      Pick<Order, "id" | "order_number" | "patient_name" | "status" | "total" | "created_at">
    >,
    pendingOrders: pendingResult.count ?? 0,
    monthOrders: monthOrders.filter((order) => order.status !== "cancelled").length,
    monthRevenue,
    patients: patientsResult.count ?? 0,
    lowStock: (lowStockResult.data ?? []) as Array<
      Pick<Product, "id" | "name" | "stock" | "category" | "active">
    >,
    activeProducts: activeResult.count ?? 0,
  };
}

export async function getPatientOverview(userId: string) {
  const supabase = await createClient();

  const [ordersResult, featuredResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .gt("stock", 0)
      .gt("price", 0)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(4),
  ]);

  if (ordersResult.error) logAndThrow("No pudimos cargar tu resumen.", ordersResult.error);
  if (featuredResult.error) logAndThrow("No pudimos cargar el catálogo.", featuredResult.error);

  const orders = (ordersResult.data ?? []) as Array<
    Pick<Order, "id" | "order_number" | "status" | "total" | "created_at">
  >;

  return {
    orders,
    totalOrders: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    totalSpent: orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0),
    featured: (featuredResult.data ?? []) as Product[],
  };
}
