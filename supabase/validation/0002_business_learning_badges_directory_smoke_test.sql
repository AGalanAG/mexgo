-- MexGo Hackathon - Smoke Test 0002 (Business + Learning + Badges + Directory)
-- Run after:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql

-- 1) Structural checks (tables)
SELECT to_regclass('public.business_profiles') AS business_profiles_table;
SELECT to_regclass('public.business_team_members') AS business_team_members_table;
SELECT to_regclass('public.learning_sources') AS learning_sources_table;
SELECT to_regclass('public.learning_modules') AS learning_modules_table;
SELECT to_regclass('public.learning_completions') AS learning_completions_table;
SELECT to_regclass('public.badge_definitions') AS badge_definitions_table;
SELECT to_regclass('public.badge_requirements') AS badge_requirements_table;
SELECT to_regclass('public.business_badges') AS business_badges_table;
SELECT to_regclass('public.badge_events') AS badge_events_table;
SELECT to_regclass('public.directory_profiles') AS directory_profiles_table;
SELECT to_regclass('public.directory_events') AS directory_events_table;

-- 2) Enum checks
SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'business_status'
) AS business_status_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'learning_audience'
) AS learning_audience_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'completion_status'
) AS completion_status_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'badge_status'
) AS badge_status_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM unnest(enum_range(NULL::public.role_code)) AS x(v)
  WHERE x.v::text = 'EMPLEADO_NEGOCIO'
) AS role_code_has_empleado_negocio;

-- 3) Seed checks
SELECT code, public_name, is_active
FROM public.badge_definitions
ORDER BY code;

SELECT name, source_type, is_active
FROM public.learning_sources
ORDER BY name;

-- 4) Functional smoke test using one existing auth user
DO $$
DECLARE
  v_owner_user_id uuid;
  v_business_id uuid;
  v_member_id uuid;
  v_source_id uuid;
  v_module_id uuid;
  v_badge_id uuid;
  v_business_badge_id uuid;
BEGIN
  SELECT id INTO v_owner_user_id FROM auth.users LIMIT 1;

  IF v_owner_user_id IS NULL THEN
    RAISE NOTICE 'Smoke test partial: no users found in auth.users, skipping write checks.';
    RETURN;
  END IF;

  INSERT INTO public.business_profiles (
    owner_user_id,
    business_name,
    business_description,
    category_code,
    phone,
    email,
    borough,
    neighborhood,
    latitude,
    longitude,
    status,
    is_public
  ) VALUES (
    v_owner_user_id,
    'Smoke Cafe',
    'Negocio de prueba para flujo v2',
    'CAFETERIA',
    '+525511111111',
    'smoke@example.com',
    'Cuauhtemoc',
    'Centro',
    19.432600,
    -99.133200,
    'ACTIVE',
    true
  )
  RETURNING id INTO v_business_id;

  INSERT INTO public.business_team_members (
    business_id,
    user_id,
    full_name,
    role_title,
    is_owner,
    is_active,
    joined_at
  ) VALUES (
    v_business_id,
    v_owner_user_id,
    'Smoke Owner',
    'Propietario',
    true,
    true,
    now()
  )
  RETURNING id INTO v_member_id;

  SELECT id INTO v_source_id
  FROM public.learning_sources
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_source_id IS NULL THEN
    RAISE EXCEPTION 'Smoke test failed: no rows found in learning_sources.';
  END IF;

  INSERT INTO public.learning_modules (
    source_id,
    slug,
    title,
    description,
    audience,
    category,
    estimated_minutes,
    pass_score,
    is_active
  ) VALUES (
    v_source_id,
    'smoke-servicio-seguro-' || replace(v_business_id::text, '-', ''),
    'Servicio Seguro Smoke',
    'Modulo de prueba',
    'STAFF',
    'servicio',
    20,
    70,
    true
  )
  RETURNING id INTO v_module_id;

  INSERT INTO public.learning_completions (
    business_id,
    member_id,
    module_id,
    attempt_number,
    score,
    status,
    validated_by,
    validated_at
  ) VALUES (
    v_business_id,
    v_member_id,
    v_module_id,
    1,
    95,
    'VALIDATED',
    v_owner_user_id,
    now()
  );

  SELECT id INTO v_badge_id
  FROM public.badge_definitions
  WHERE code = 'SERVICIO_SEGURO'
  LIMIT 1;

  IF v_badge_id IS NULL THEN
    RAISE EXCEPTION 'Smoke test failed: badge SERVICIO_SEGURO not found.';
  END IF;

  INSERT INTO public.business_badges (
    business_id,
    badge_id,
    status,
    progress_percent,
    awarded_at,
    is_public
  ) VALUES (
    v_business_id,
    v_badge_id,
    'AWARDED',
    100,
    now(),
    true
  )
  RETURNING id INTO v_business_badge_id;

  INSERT INTO public.badge_events (
    business_badge_id,
    event_type,
    actor_user_id,
    payload
  ) VALUES (
    v_business_badge_id,
    'AWARD',
    v_owner_user_id,
    jsonb_build_object('reason', 'smoke_test')
  );

  INSERT INTO public.directory_profiles (
    business_id,
    public_name,
    short_description,
    categories,
    badge_codes,
    city,
    state,
    public_score
  ) VALUES (
    v_business_id,
    'Smoke Cafe Publico',
    'Perfil publico de prueba',
    ARRAY['CAFETERIA']::text[],
    ARRAY['SERVICIO_SEGURO']::text[],
    'CDMX',
    'Ciudad de Mexico',
    0.90000
  );

  INSERT INTO public.directory_events (
    business_id,
    event_type,
    source
  ) VALUES (
    v_business_id,
    'VIEW',
    'smoke_test'
  );

  RAISE NOTICE 'Smoke test 0002 write operations completed for business: %', v_business_id;
END
$$;

-- 5) Post-run summary
SELECT
  (SELECT COUNT(*) FROM public.business_profiles) AS business_profiles_count,
  (SELECT COUNT(*) FROM public.business_team_members) AS business_team_members_count,
  (SELECT COUNT(*) FROM public.learning_modules) AS learning_modules_count,
  (SELECT COUNT(*) FROM public.learning_completions) AS learning_completions_count,
  (SELECT COUNT(*) FROM public.business_badges) AS business_badges_count,
  (SELECT COUNT(*) FROM public.badge_events) AS badge_events_count,
  (SELECT COUNT(*) FROM public.directory_profiles) AS directory_profiles_count,
  (SELECT COUNT(*) FROM public.directory_events) AS directory_events_count;

-- 6) Read-back sample
SELECT
  bp.id AS business_id,
  bp.business_name,
  bp.status,
  dp.public_name,
  dp.badge_codes,
  bb.status AS badge_status,
  bb.progress_percent
FROM public.business_profiles bp
LEFT JOIN public.directory_profiles dp ON dp.business_id = bp.id
LEFT JOIN public.business_badges bb ON bb.business_id = bp.id
ORDER BY bp.created_at DESC
LIMIT 10;
