-- MexGo Hackathon - Minimal DB Core (Auth + Profile + RBAC)
-- Scope: Fase 1 backend only

-- 1) Enum for system roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'role_code' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.role_code AS ENUM (
      'TURISTA',
      'ENCARGADO_NEGOCIO',
      'ADMIN',
      'SUPERADMIN'
    );
  END IF;
END
$$;

-- 2) User extended profile
CREATE TABLE IF NOT EXISTS public.users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text NULL,
  language_code text NOT NULL,
  country_of_origin text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Roles catalog
CREATE TABLE IF NOT EXISTS public.roles (
  id smallserial PRIMARY KEY,
  code public.role_code UNIQUE NOT NULL,
  description text NOT NULL
);

-- 4) User-role relation
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id smallint NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

-- 5) Minimal indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_country
  ON public.users_profile (country_of_origin);

CREATE INDEX IF NOT EXISTS idx_users_profile_language
  ON public.users_profile (language_code);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON public.user_roles (role_id);

-- 6) Seed roles (idempotent)
INSERT INTO public.roles (code, description)
VALUES
  ('TURISTA', 'Usuario turista de la plataforma'),
  ('ENCARGADO_NEGOCIO', 'Encargado de negocio registrado'),
  ('ADMIN', 'Administrador funcional'),
  ('SUPERADMIN', 'Administrador tecnico')
ON CONFLICT (code) DO UPDATE
SET description = EXCLUDED.description;

-- 7) Keep users_profile.updated_at in sync
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_profile_set_updated_at ON public.users_profile;

CREATE TRIGGER trg_users_profile_set_updated_at
BEFORE UPDATE ON public.users_profile
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
