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
