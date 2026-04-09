-- Seed de 30 negocios ficticios para Discover.
-- Requiere al menos 1 usuario en auth.users para owner_user_id.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users) THEN
    RAISE EXCEPTION 'No hay usuarios en auth.users. Crea al menos 1 usuario antes de ejecutar este seed.';
  END IF;
END
$$;

WITH seed_data AS (
  SELECT *
  FROM (
    VALUES
      (1,  'Antojitos Reforma',         'Comida mexicana casera cerca de zona de oficinas.',                 'FOOD',      'Cuauhtemoc',      'Juarez',            19.430900::numeric, -99.157000::numeric, 'Ciudad de Mexico', 'CDMX',             4.72::numeric, ARRAY['Comida','Tradicional']::text[]),
      (2,  'Cafe Alameda',              'Cafe de especialidad y pan horneado diario.',                        'CAFE',      'Cuauhtemoc',      'Centro',            19.435000::numeric, -99.143000::numeric, 'Ciudad de Mexico', 'CDMX',             4.41::numeric, ARRAY['Cafe','Desayuno']::text[]),
      (3,  'Mercado Roma Local 12',     'Puesto local con antojitos y bebidas frescas.',                      'FOOD',      'Cuauhtemoc',      'Roma Norte',        19.414500::numeric, -99.164000::numeric, 'Ciudad de Mexico', 'CDMX',             4.30::numeric, ARRAY['Comida','Rapida']::text[]),
      (4,  'Artesanias Coyoacan Sur',   'Tienda de artesanias mexicanas con piezas de autor.',                'ARTS',      'Coyoacan',        'Del Carmen',        19.349200::numeric, -99.162600::numeric, 'Ciudad de Mexico', 'CDMX',             4.65::numeric, ARRAY['Artesanias','Regalos']::text[]),
      (5,  'Taller de Barro Xochimilco','Ceramica utilitaria y decorativa hecha a mano.',                     'ARTS',      'Xochimilco',      'San Gregorio',      19.262100::numeric, -99.103400::numeric, 'Ciudad de Mexico', 'CDMX',             4.08::numeric, ARRAY['Artesanias','Hogar']::text[]),
      (6,  'Panaderia Chapultepec',     'Pan dulce, pan salado y cafe para llevar.',                          'BAKERY',    'Miguel Hidalgo',  'San Miguel Chapultepec', 19.407700::numeric, -99.190200::numeric, 'Ciudad de Mexico', 'CDMX',       4.12::numeric, ARRAY['Panaderia','Cafe']::text[]),
      (7,  'Taqueria Nayarit Centro',   'Tacos de pescado y mariscos estilo pacifico.',                       'FOOD',      'Centro',          'Centro',            21.509300::numeric, -104.895400::numeric, 'Tepic',            'Nayarit',          4.19::numeric, ARRAY['Comida','Mariscos']::text[]),
      (8,  'Cafeteria Malecon 7',       'Bebidas frias y calientes frente al malecon.',                       'CAFE',      'Mazatlan',        'Centro',            23.200300::numeric, -106.423100::numeric, 'Mazatlan',         'Sinaloa',          4.54::numeric, ARRAY['Cafe','Postres']::text[]),
      (9,  'Souvenirs Bahia Azul',      'Recuerdos, textiles y productos hechos en la region.',               'RETAIL',    'Puerto Vallarta', 'Emiliano Zapata',   20.602100::numeric, -105.235300::numeric, 'Puerto Vallarta',  'Jalisco',          4.28::numeric, ARRAY['Regalos','Turismo']::text[]),
      (10, 'Bistro Tlaquepaque Uno',    'Cocina local con ingredientes de temporada.',                        'FOOD',      'Tlaquepaque',     'Centro',            20.640200::numeric, -103.311700::numeric, 'Tlaquepaque',      'Jalisco',          4.36::numeric, ARRAY['Comida','Bistro']::text[]),
      (11, 'Cafe Merida Patio',         'Cafe yucateco con reposteria regional.',                             'CAFE',      'Merida',          'Santiago',          20.975900::numeric, -89.625400::numeric,  'Merida',           'Yucatan',          4.57::numeric, ARRAY['Cafe','Regional']::text[]),
      (12, 'Cocina Itza Mercado',       'Platillos tradicionales y menu para turistas.',                      'FOOD',      'Valladolid',      'Centro',            20.689600::numeric, -88.201600::numeric,  'Valladolid',       'Yucatan',          4.22::numeric, ARRAY['Comida','Tradicional']::text[]),
      (13, 'Casa Textil Oaxaca',        'Textiles bordados por cooperativas locales.',                        'ARTS',      'Oaxaca de Juarez','Centro',            17.060600::numeric, -96.725300::numeric,  'Oaxaca',           'Oaxaca',           4.66::numeric, ARRAY['Artesanias','Textil']::text[]),
      (14, 'Mezcaleria Monte Alban',    'Degustacion y venta de mezcal artesanal.',                           'BEVERAGE',  'Oaxaca de Juarez','Jalatlaco',         17.055000::numeric, -96.714500::numeric,  'Oaxaca',           'Oaxaca',           4.49::numeric, ARRAY['Bebidas','Local']::text[]),
      (15, 'Chocolate Maya Cozumel',    'Chocolate artesanal y bebidas de cacao.',                            'SWEETS',    'Cozumel',         'Centro',            20.510800::numeric, -86.948900::numeric,  'Cozumel',          'Quintana Roo',     4.51::numeric, ARRAY['Dulces','Turismo']::text[]),
      (16, 'Restaurante Bacalar 5',     'Comida del sureste con vista a la laguna.',                          'FOOD',      'Bacalar',         'Centro',            18.676600::numeric, -88.393700::numeric,  'Bacalar',          'Quintana Roo',     4.62::numeric, ARRAY['Comida','Regional']::text[]),
      (17, 'Pan y Cacao Campeche',      'Pan artesanal, cafe y cacao local.',                                 'BAKERY',    'Campeche',        'Centro Historico',  19.845100::numeric, -90.523400::numeric,  'Campeche',         'Campeche',         4.09::numeric, ARRAY['Panaderia','Cafe']::text[]),
      (18, 'Artesanias del Golfo',      'Piezas decorativas y utilitarias de madera.',                        'ARTS',      'Veracruz',        'Malecon',           19.199100::numeric, -96.134200::numeric,  'Veracruz',         'Veracruz',         4.14::numeric, ARRAY['Artesanias','Hogar']::text[]),
      (19, 'Cafe Puerto Sol',           'Especialidad en cafe de altura y metodos filtrados.',                'CAFE',      'Xalapa',          'Centro',            19.543800::numeric, -96.910200::numeric,  'Xalapa',           'Veracruz',         4.47::numeric, ARRAY['Cafe','Especialidad']::text[]),
      (20, 'Mercadito Angelopolis',     'Comida rapida local y snacks regionales.',                           'FOOD',      'Puebla',          'Angelopolis',       19.041400::numeric, -98.206300::numeric,  'Puebla',           'Puebla',           4.18::numeric, ARRAY['Comida','Snacks']::text[]),
      (21, 'Talavera Viva',             'Ceramica talavera certificada y decoracion.',                         'ARTS',      'Puebla',          'Centro',            19.041000::numeric, -98.206200::numeric,  'Puebla',           'Puebla',           4.63::numeric, ARRAY['Artesanias','Decoracion']::text[]),
      (22, 'Cantina del Centro MTY',    'Botanas norteñas y cocina regional.',                                'FOOD',      'Monterrey',       'Centro',            25.671400::numeric, -100.309000::numeric, 'Monterrey',        'Nuevo Leon',       4.07::numeric, ARRAY['Comida','Nortena']::text[]),
      (23, 'Cafe Santa Lucia',          'Cafe, reposteria y brunch en paseo urbano.',                         'CAFE',      'Monterrey',       'Obispado',          25.682200::numeric, -100.337400::numeric, 'Monterrey',        'Nuevo Leon',       4.32::numeric, ARRAY['Cafe','Brunch']::text[]),
      (24, 'Mercado San Pedro 21',      'Productos locales y area de comida para visitantes.',                'RETAIL',    'San Pedro Garza Garcia','Del Valle',    25.651700::numeric, -100.402300::numeric, 'San Pedro',        'Nuevo Leon',       4.26::numeric, ARRAY['Mercado','Turismo']::text[]),
      (25, 'Cocina Frontera Norte',     'Comida casera con opciones vegetarianas.',                           'FOOD',      'Tijuana',         'Zona Centro',       32.529500::numeric, -117.038200::numeric, 'Tijuana',          'Baja California',  4.35::numeric, ARRAY['Comida','Casera']::text[]),
      (26, 'Panaderia Pacifico',        'Pan artesanal y galletas de mantequilla.',                           'BAKERY',    'Ensenada',        'Centro',            31.866700::numeric, -116.596400::numeric, 'Ensenada',         'Baja California',  4.03::numeric, ARRAY['Panaderia','Dulce']::text[]),
      (27, 'Cafe La Paz Marina',        'Cafe de origen y bebidas frias frente al mar.',                      'CAFE',      'La Paz',          'Malecon',           24.142600::numeric, -110.312900::numeric, 'La Paz',           'Baja California Sur', 4.46::numeric, ARRAY['Cafe','Turismo']::text[]),
      (28, 'Souvenirs Cabo Faro',       'Recuerdos y articulos de viaje para turistas.',                      'RETAIL',    'Los Cabos',       'Centro',            22.890500::numeric, -109.916700::numeric, 'Los Cabos',        'Baja California Sur', 4.24::numeric, ARRAY['Regalos','Turismo']::text[]),
      (29, 'Casa del Mole Queretaro',   'Moles y salsas artesanales para degustacion y venta.',              'FOOD',      'Queretaro',       'Centro',            20.588800::numeric, -100.389900::numeric, 'Queretaro',        'Queretaro',        4.55::numeric, ARRAY['Comida','Gourmet']::text[]),
      (30, 'Galeria San Miguel Arte',   'Piezas de arte contemporaneo y artesania local.',                    'ARTS',      'San Miguel de Allende', 'Centro',      20.914000::numeric, -100.743600::numeric, 'San Miguel de Allende', 'Guanajuato', 4.60::numeric, ARRAY['Arte','Artesanias']::text[])
  ) AS t(
    idx,
    business_name,
    business_description,
    category_code,
    borough,
    neighborhood,
    latitude,
    longitude,
    city,
    state,
    public_score,
    categories
  )
),
owners AS (
  SELECT
    s.*,
    (
      SELECT u.id
      FROM auth.users u
      ORDER BY COALESCE(u.created_at, now()), u.id
      LIMIT 1
      OFFSET ((s.idx - 1) % (SELECT COUNT(*) FROM auth.users))
    ) AS owner_user_id
  FROM seed_data s
),
resolved AS (
  SELECT
    o.owner_user_id,
    o.business_name,
    o.business_description,
    o.category_code,
    o.borough,
    o.neighborhood,
    o.latitude,
    o.longitude,
    o.categories,
    o.city,
    o.state,
    o.public_score
  FROM owners o
),
upsert_businesses AS (
  INSERT INTO public.business_profiles (
    owner_user_id,
    business_name,
    business_description,
    category_code,
    borough,
    neighborhood,
    latitude,
    longitude,
    status,
    is_public
  )
  SELECT
    r.owner_user_id,
    r.business_name,
    r.business_description,
    r.category_code,
    r.borough,
    r.neighborhood,
    r.latitude,
    r.longitude,
    'ACTIVE'::public.business_status,
    true
  FROM resolved r
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.business_profiles bp
    WHERE bp.business_name = r.business_name
  )
  RETURNING id
),
directory_source AS (
  SELECT
    bp.id AS business_id,
    r.business_name,
    r.business_description,
    r.categories,
    r.city,
    r.state,
    r.public_score
  FROM resolved r
  CROSS JOIN (SELECT COUNT(*) AS inserted_count FROM upsert_businesses) ins
  JOIN public.business_profiles bp
    ON bp.business_name = r.business_name
)
INSERT INTO public.directory_profiles (
  business_id,
  public_name,
  short_description,
  categories,
  city,
  state,
  public_score
)
SELECT
  ds.business_id,
  ds.business_name,
  LEFT(ds.business_description, 180),
  ds.categories,
  ds.city,
  ds.state,
  ds.public_score
FROM directory_source ds
ON CONFLICT (business_id)
DO UPDATE SET
  public_name = EXCLUDED.public_name,
  short_description = EXCLUDED.short_description,
  categories = EXCLUDED.categories,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  public_score = EXCLUDED.public_score,
  updated_at = now();

COMMIT;
