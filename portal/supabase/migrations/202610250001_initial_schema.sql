-- Un Viaje Astral · Portal de pacientes
-- 0001 · Esquema base
-- Ejecutar en el SQL Editor de Supabase o con `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'patient' check (role in ('patient', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('flores', 'rosin_hash', 'vapes')),
  description text,
  thc text,
  cbd text,
  sativa_percent integer check (sativa_percent is null or sativa_percent between 0 and 100),
  indica_percent integer check (indica_percent is null or indica_percent between 0 and 100),
  aromas text[] not null default '{}',
  flavors text[] not null default '{}',
  effects text[] not null default '{}',
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  presentation text,
  image_url text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid references public.profiles (id) on delete set null,
  patient_name text not null,
  patient_email text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  payment_method text not null
    check (payment_method in ('cash', 'bank_transfer')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'cancelled')),
  fulfillment_method text not null default 'pickup'
    check (fulfillment_method in ('pickup', 'delivery')),
  contact_phone text not null,
  delivery_address text,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text,
  therapeutic_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  category text check (category is null or category in ('flores', 'rosin_hash', 'vapes')),
  image_url text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists products_category_active_idx on public.products (category, active);
create index if not exists products_sort_idx on public.products (sort_order, name);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

comment on table public.profiles is 'Perfiles de pacientes y administradores del portal.';
comment on table public.products is 'Catálogo privado de flores secas, rosin hash y vapes.';
comment on table public.orders is 'Pedidos realizados por pacientes registrados.';
comment on table public.order_items is 'Detalle histórico de productos por pedido.';
