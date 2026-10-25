-- Un Viaje Astral · Portal de pacientes
-- Bootstrap manual: ejecuta todas las migraciones en orden.
-- Archivo generado desde supabase/migrations/. No editar a mano.

begin;

-- ===========================================================================
-- 202610250001_initial_schema.sql
-- ===========================================================================
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

-- ===========================================================================
-- 202610250002_rls.sql
-- ===========================================================================
-- Un Viaje Astral · Portal de pacientes
-- 0002 · Row Level Security
-- El catálogo es privado: sólo usuarios autenticados y administradores pueden leerlo.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.can_access_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders
    where id = p_order_id
      and (user_id = auth.uid() or public.is_admin())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.can_access_order(uuid) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_order(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert"
on public.profiles for insert
to authenticated
with check (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete"
on public.profiles for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
drop policy if exists "products_select_active_or_admin" on public.products;
create policy "products_select_active_or_admin"
on public.products for select
to authenticated
using (active = true or public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Los pacientes crean pedidos exclusivamente mediante create_order()
-- y los cancelan mediante cancel_order(). No hay políticas de INSERT/DELETE.

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items for select
to authenticated
using (public.can_access_order(order_id));

-- ===========================================================================
-- 202610250003_functions.sql
-- ===========================================================================
-- Un Viaje Astral · Portal de pacientes
-- 0003 · Funciones de negocio y triggers
-- Los precios y el stock siempre se validan en el servidor.

-- ---------------------------------------------------------------------------
-- Perfil automático al registrarse
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Paciente'
    ),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    'patient'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Protección contra escalada de roles
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id <> old.id then
    raise exception 'No se puede cambiar el identificador del perfil.';
  end if;

  if new.role <> old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Creación atómica de pedidos
-- p_items: [{"product_id": "uuid", "quantity": 1}, ...]
-- ---------------------------------------------------------------------------
create or replace function public.create_order(
  p_items jsonb,
  p_payment_method text,
  p_fulfillment_method text,
  p_contact_phone text,
  p_delivery_address text default null,
  p_notes text default null,
  p_therapeutic_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_product public.products%rowtype;
  v_order_id uuid;
  v_total numeric(12, 2) := 0;
  v_quantity integer;
  v_contact_phone text;
  v_patient_email text;
  v_item record;
begin
  if v_user_id is null then
    raise exception 'Tenés que iniciar sesión para confirmar el pedido.';
  end if;

  if p_payment_method is null or p_payment_method not in ('cash', 'bank_transfer') then
    raise exception 'Método de pago inválido.';
  end if;

  if p_fulfillment_method is null or p_fulfillment_method not in ('pickup', 'delivery') then
    raise exception 'Método de entrega inválido.';
  end if;

  if p_fulfillment_method = 'delivery'
     and nullif(trim(p_delivery_address), '') is null then
    raise exception 'Ingresá una dirección para la entrega.';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío.';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id;

  if not found then
    raise exception 'No encontramos tu perfil de paciente.';
  end if;

  v_contact_phone := coalesce(nullif(trim(p_contact_phone), ''), v_profile.phone);
  if v_contact_phone is null or length(v_contact_phone) < 6 then
    raise exception 'Ingresá un teléfono de contacto.';
  end if;

  select email into v_patient_email
  from auth.users
  where id = v_user_id;

  -- Primera pasada: bloquear filas, validar stock y calcular el total real.
  for v_item in
    select
      (value ->> 'product_id')::uuid as product_id,
      sum(coalesce((value ->> 'quantity')::integer, 0))::integer as quantity
    from jsonb_array_elements(p_items)
    group by 1
  loop
    if v_item.product_id is null then
      raise exception 'Uno de los productos del carrito es inválido.';
    end if;

    v_quantity := v_item.quantity;
    if v_quantity is null or v_quantity < 1 or v_quantity > 99 then
      raise exception 'La cantidad de uno de los productos es inválida.';
    end if;

    select * into v_product
    from public.products
    where id = v_item.product_id
      and active = true
    for update;

    if not found then
      raise exception 'Uno de los productos ya no está disponible.';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'Stock insuficiente para %.', v_product.name;
    end if;

    v_total := v_total + (v_product.price * v_quantity);
  end loop;

  if v_total <= 0 then
    raise exception 'El total del pedido no puede ser cero. Contactá a la asociación.';
  end if;

  insert into public.orders (
    user_id,
    patient_name,
    patient_email,
    status,
    payment_method,
    payment_status,
    fulfillment_method,
    contact_phone,
    delivery_address,
    subtotal,
    total,
    notes,
    therapeutic_notes
  )
  values (
    v_user_id,
    v_profile.full_name,
    v_patient_email,
    'pending',
    p_payment_method,
    'pending',
    p_fulfillment_method,
    v_contact_phone,
    nullif(trim(p_delivery_address), ''),
    v_total,
    v_total,
    nullif(trim(p_notes), ''),
    nullif(trim(p_therapeutic_notes), '')
  )
  returning id into v_order_id;

  -- Segunda pasada: guardar el detalle histórico y descontar stock.
  for v_item in
    select
      (value ->> 'product_id')::uuid as product_id,
      sum(coalesce((value ->> 'quantity')::integer, 0))::integer as quantity
    from jsonb_array_elements(p_items)
    group by 1
  loop
    select * into v_product
    from public.products
    where id = v_item.product_id
      and active = true
    for update;

    if not found then
      raise exception 'Uno de los productos ya no está disponible.';
    end if;

    if v_product.stock < v_item.quantity then
      raise exception 'Stock insuficiente para %.', v_product.name;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      category,
      image_url,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.slug,
      v_product.category,
      v_product.image_url,
      v_product.price,
      v_item.quantity,
      v_product.price * v_item.quantity
    );

    update public.products
    set stock = stock - v_item.quantity,
        updated_at = now()
    where id = v_product.id;
  end loop;

  return v_order_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cancelación por parte del paciente
-- ---------------------------------------------------------------------------
create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if auth.uid() is null then
    raise exception 'Tenés que iniciar sesión.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'El pedido no existe.';
  end if;

  if v_order.user_id <> auth.uid() then
    raise exception 'No tenés permiso para cancelar este pedido.';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Solo podés cancelar pedidos pendientes.';
  end if;

  update public.orders
  set status = 'cancelled',
      payment_status = 'cancelled'
  where id = p_order_id;

  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update public.products
      set stock = stock + v_item.quantity,
          updated_at = now()
      where id = v_item.product_id;
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cambio de estado por parte del administrador
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text,
  p_payment_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if not public.is_admin() then
    raise exception 'No tenés permisos de administrador.';
  end if;

  if p_status is null
     or p_status not in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled') then
    raise exception 'Estado de pedido inválido.';
  end if;

  if p_payment_status is null
     or p_payment_status not in ('pending', 'paid', 'cancelled') then
    raise exception 'Estado de pago inválido.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'El pedido no existe.';
  end if;

  if v_order.status = 'cancelled' and p_status <> 'cancelled' then
    raise exception 'Un pedido cancelado no se puede reactivar.';
  end if;

  if p_status = 'cancelled' and v_order.status <> 'cancelled' then
    for v_item in
      select product_id, quantity
      from public.order_items
      where order_id = p_order_id
    loop
      if v_item.product_id is not null then
        update public.products
        set stock = stock + v_item.quantity,
            updated_at = now()
        where id = v_item.product_id;
      end if;
    end loop;
  end if;

  update public.orders
  set status = p_status,
      payment_status = case
        when p_status = 'cancelled' then 'cancelled'
        else p_payment_status
      end
  where id = p_order_id;
end;
$$;

revoke all on function public.create_order(jsonb, text, text, text, text, text, text) from public;
revoke all on function public.cancel_order(uuid) from public;
revoke all on function public.admin_update_order_status(uuid, text, text) from public;
grant execute on function public.create_order(jsonb, text, text, text, text, text, text) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.admin_update_order_status(uuid, text, text) to authenticated;

-- ===========================================================================
-- 202610250004_storage.sql
-- ===========================================================================
-- Un Viaje Astral · Portal de pacientes
-- 0004 · Storage para imágenes de catálogo

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- ===========================================================================
-- 202610250005_realtime.sql
-- ===========================================================================
-- Un Viaje Astral · Portal de pacientes
-- 0005 · Realtime para pedidos y catálogo

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table public.orders;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'products'
    ) then
      alter publication supabase_realtime add table public.products;
    end if;
  end if;
end
$$;

-- ===========================================================================
-- 202610250006_seed_catalog.sql
-- ===========================================================================
-- Un Viaje Astral · Portal de pacientes
-- 0006 · Catálogo inicial
--
-- IMPORTANTE:
-- Los productos se cargan con precio 0, stock 0 y active = false para que el
-- administrador complete precios, stock y disponibilidad desde /admin/catalogo.
-- No inventamos precios ni concentraciones que no estén publicadas.
-- La ficha "Genética 07 · A definir" y las fichas de vapes quedan reservadas
-- para que el administrador las complete sin tocar código.

insert into public.products (
  slug, name, category, description, thc, cbd, sativa_percent, indica_percent,
  aromas, flavors, effects, price, stock, presentation, image_url, active, featured, sort_order
)
values
  (
    'runtz', 'Runtz', 'flores',
    'Aromas y sabores afrutados y dulces. Efecto relajante.',
    '23–26%', null, null, null,
    array['Afrutado', 'Dulce'], array['Frutal', 'Dulce'], array['Relajante'],
    0, 0, 'Flores secas', '/products/runtz.webp', false, false, 10
  ),
  (
    'green-poison', 'Green Poison', 'flores',
    'Aromas y sabores afrutados, especiados, skunk y dulces. Efectos relajantes y creativos.',
    '15–20%', null, null, null,
    array['Afrutado', 'Especiado', 'Skunk', 'Dulce'],
    array['Frutal', 'Especiado', 'Skunk', 'Dulce'],
    array['Relajante', 'Creatividad'],
    0, 0, 'Flores secas', '/products/green-poison.webp', false, false, 20
  ),
  (
    'sweet-mandarine-zkittlez', 'Sweet Mandarine Zkittlez', 'flores',
    'Aromas y sabores dulces, diesel, especiados, naranja, mango, pino y frescos. Efectos estimulantes, creatividad y bienestar.',
    '19–24%', null, null, null,
    array['Dulce', 'Diesel', 'Especiado', 'Naranja', 'Mango', 'Pino'],
    array['Dulce', 'Diesel', 'Naranja', 'Mango', 'Pino', 'Fresco'],
    array['Estimulante', 'Creatividad', 'Bienestar'],
    0, 0, 'Flores secas', '/products/sweet-mandarine-zkittlez.webp', false, false, 30
  ),
  (
    'cream-mandarine', 'Cream Mandarine', 'flores',
    'Aromas y sabores de frutos rojos, agrios, cítricos, mandarina y agridulces. Efectos psicoactivos, creativos, estimulantes y relajantes.',
    '18–20%', null, null, null,
    array['Frutos rojos', 'Cítrico', 'Mandarina', 'Agridulce'],
    array['Frutos rojos', 'Agrio', 'Cítrico', 'Mandarina', 'Agridulce'],
    array['Creatividad', 'Estimulante', 'Relajante'],
    0, 0, 'Flores secas', '/products/cream-mandarine.webp', false, false, 40
  ),
  (
    'cbd-compassion-lime', 'CBD Compassion Lime', 'flores',
    'Aromas y sabores cítricos, lima y picantes. Efectos corporales con psicoactividad reducida.',
    null, '13,5%', null, null,
    array['Cítrico', 'Lima', 'Picante'],
    array['Cítrico', 'Lima', 'Picante'],
    array['Corporal', 'Psicoactividad reducida'],
    0, 0, 'Flores secas', '/products/cbd-compassion-lime.webp', false, false, 50
  ),
  (
    'red-pure-cbd', 'Red Pure CBD', 'flores',
    'Aromas y sabores de ciprés, terroso, pino, fresco, frutos del bosque y dulce. Efectos relajantes.',
    '0,4–0,5%', '15–17%', null, null,
    array['Ciprés', 'Terroso', 'Pino', 'Frutos del bosque', 'Dulce'],
    array['Ciprés', 'Terroso', 'Pino', 'Fresco', 'Frutos del bosque', 'Dulce'],
    array['Relajante'],
    0, 0, 'Flores secas', '/products/red-pure-cbd.webp', false, false, 60
  ),
  (
    'genetica-07-a-definir', 'Genética 07 · A definir', 'flores',
    'Ficha reservada para una nueva genética. Completá nombre, cannabinoides, proporción sativa/indica, aromas, sabores, precio y stock desde el panel de administración.',
    null, null, null, null,
    array[]::text[], array[]::text[], array[]::text[],
    0, 0, 'Flores secas', null, false, false, 70
  ),
  (
    'rosin-hash', 'Rosin Hash', 'rosin_hash',
    'Extracción libre de solventes químicos a partir de hash. Alta pureza y libre de residuos. Consultá las genéticas disponibles.',
    null, null, null, null,
    array[]::text[], array[]::text[], array[]::text[],
    0, 0, 'Extracción sin solventes', '/products/rosin-hash.webp', false, false, 10
  ),
  (
    'rosin-de-flor', 'Rosin de Flor', 'rosin_hash',
    'Extracción libre de solventes químicos a partir de flores. Alta pureza y libre de residuos. Consultá las genéticas disponibles.',
    null, null, null, null,
    array[]::text[], array[]::text[], array[]::text[],
    0, 0, 'Extracción sin solventes', '/products/rosin-de-flor.webp', false, false, 20
  ),
  (
    'vape-01-a-definir', 'Vape 01 · A definir', 'vapes',
    'Ficha reservada para un producto de vaporización. Completá nombre, cannabinoides, perfil de aromas, precio y stock desde el panel de administración.',
    null, null, null, null,
    array[]::text[], array[]::text[], array[]::text[],
    0, 0, 'Vape', '/products/vape-placeholder.svg', false, false, 10
  ),
  (
    'vape-02-a-definir', 'Vape 02 · A definir', 'vapes',
    'Ficha reservada para un segundo producto de vaporización. Completá nombre, cannabinoides, perfil de aromas, precio y stock desde el panel de administración.',
    null, null, null, null,
    array[]::text[], array[]::text[], array[]::text[],
    0, 0, 'Vape', '/products/vape-placeholder.svg', false, false, 20
  )
on conflict (slug) do nothing;

commit;