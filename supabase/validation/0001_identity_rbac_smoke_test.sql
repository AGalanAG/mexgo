-- MexGo Hackathon - Smoke Test (Identity + RBAC)
-- Run this in Supabase SQL Editor after executing migration 0001_hackathon_identity_rbac.sql

-- 1) Structural checks
SELECT to_regclass('public.users_profile') AS users_profile_table;
SELECT to_regclass('public.roles') AS roles_table;
SELECT to_regclass('public.user_roles') AS user_roles_table;
SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'role_code'
) AS role_code_enum_exists;

-- 2) Seed checks
SELECT code, description
FROM public.roles
ORDER BY id;

SELECT COUNT(*) AS role_count
FROM public.roles
WHERE code IN ('TURISTA', 'ENCARGADO_NEGOCIO', 'ADMIN', 'SUPERADMIN');

-- 3) Index checks
SELECT to_regclass('public.idx_users_profile_country') AS idx_users_profile_country;
SELECT to_regclass('public.idx_users_profile_language') AS idx_users_profile_language;
SELECT to_regclass('public.idx_user_roles_role') AS idx_user_roles_role;

-- 4) Functional checks with one existing auth user
-- This block does not create users in auth.users; it uses an existing one.
DO $$
DECLARE
  v_user_id uuid;
  v_turista_role_id smallint;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Smoke test partial: no users found in auth.users, skipping profile/role write checks.';
    RETURN;
  END IF;

  SELECT id INTO v_turista_role_id
  FROM public.roles
  WHERE code = 'TURISTA';

  IF v_turista_role_id IS NULL THEN
    RAISE EXCEPTION 'Smoke test failed: TURISTA role not found in public.roles.';
  END IF;

  INSERT INTO public.users_profile (
    id,
    full_name,
    avatar_url,
    language_code,
    country_of_origin,
    email_verified
  ) VALUES (
    v_user_id,
    'Smoke Test User',
    NULL,
    'es-MX',
    'MX',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      language_code = EXCLUDED.language_code,
      country_of_origin = EXCLUDED.country_of_origin,
      email_verified = EXCLUDED.email_verified;

  INSERT INTO public.user_roles (user_id, role_id, created_by)
  VALUES (v_user_id, v_turista_role_id, v_user_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'Smoke test write operations completed for user: %', v_user_id;
END
$$;

-- 4b) Functional summary (always returns one row)
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_user_count,
  (SELECT COUNT(*) FROM public.users_profile) AS users_profile_count,
  (SELECT COUNT(*) FROM public.user_roles) AS user_roles_count;

-- 5) Read-back checks
SELECT up.id, up.full_name, up.language_code, up.country_of_origin, up.email_verified
FROM public.users_profile up
ORDER BY up.created_at DESC
LIMIT 5;

SELECT ur.user_id, r.code AS role_code, ur.created_at
FROM public.user_roles ur
JOIN public.roles r ON r.id = ur.role_id
ORDER BY ur.created_at DESC
LIMIT 10;
