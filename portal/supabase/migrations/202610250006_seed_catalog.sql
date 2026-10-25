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
