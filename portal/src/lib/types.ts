export type ProfileRole = "patient" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type ProductCategory = "flores" | "rosin_hash" | "vapes";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string | null;
  thc: string | null;
  cbd: string | null;
  sativa_percent: number | null;
  indica_percent: number | null;
  aromas: string[];
  flavors: string[];
  effects: string[];
  price: number;
  stock: number;
  presentation: string | null;
  image_url: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash" | "bank_transfer";
export type PaymentStatus = "pending" | "paid" | "cancelled";
export type FulfillmentMethod = "pickup" | "delivery";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  category: ProductCategory | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: number;
  user_id: string | null;
  patient_name: string;
  patient_email: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_method: FulfillmentMethod;
  contact_phone: string;
  delivery_address: string | null;
  subtotal: number;
  total: number;
  notes: string | null;
  therapeutic_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type AdminOrder = Order & {
  items: OrderItem[];
  profile: Pick<Profile, "full_name" | "phone"> | null;
};

export type AnalyticsRange = "semana" | "mes" | "anio";

export type AnalyticsBucket = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

export type AnalyticsData = {
  range: AnalyticsRange;
  rangeLabel: string;
  start: string;
  end: string;
  metrics: {
    revenue: number;
    orders: number;
    averageTicket: number;
    patients: number;
    pending: number;
    cancelled: number;
  };
  buckets: AnalyticsBucket[];
  statusBreakdown: Array<{ status: OrderStatus; count: number; total: number }>;
  paymentBreakdown: Array<{ method: PaymentMethod; count: number; total: number }>;
  topProducts: Array<{
    name: string;
    category: ProductCategory | null;
    quantity: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    category: ProductCategory;
    quantity: number;
    revenue: number;
  }>;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: ProductCategory;
  stock: number;
  quantity: number;
};

export type ActionState = {
  error?: string;
  message?: string;
};
