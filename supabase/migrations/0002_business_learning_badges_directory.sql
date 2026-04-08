-- MexGo Hackathon - Incremental Schema v2 (Business + Learning + Badges + Directory)
-- Depends on: 0001_hackathon_identity_rbac.sql

-- 1) Extend role enum with EMPLEADO_NEGOCIO (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'role_code'
  ) THEN
    BEGIN
      ALTER TYPE public.role_code ADD VALUE IF NOT EXISTS 'EMPLEADO_NEGOCIO';
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
    END;
  END IF;
END
$$;

-- 2) New enums (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'business_status'
  ) THEN
    CREATE TYPE public.business_status AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'learning_audience'
  ) THEN
    CREATE TYPE public.learning_audience AS ENUM ('OWNER', 'STAFF', 'BOTH');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'completion_status'
  ) THEN
    CREATE TYPE public.completion_status AS ENUM ('PENDING', 'PASSED', 'FAILED', 'VALIDATED');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'badge_status'
  ) THEN
    CREATE TYPE public.badge_status AS ENUM ('IN_PROGRESS', 'AWARDED', 'EXPIRED', 'REVOKED');
  END IF;
END
$$;

-- 3) Business core
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  business_name text NOT NULL,
  business_description text NOT NULL,
  category_code text NOT NULL,
  phone text NULL,
  email text NULL,
  borough text NULL,
  neighborhood text NULL,
  latitude numeric(9,6) NULL,
  longitude numeric(9,6) NULL,
  status public.business_status NOT NULL DEFAULT 'DRAFT',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_business_profiles_latlng_pair CHECK (
    (latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.business_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role_title text NOT NULL,
  is_owner boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  invited_at timestamptz NULL,
  joined_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_business_team_members_business_user
  ON public.business_team_members (business_id, user_id)
  WHERE user_id IS NOT NULL;

-- 4) Learning domain
CREATE TABLE IF NOT EXISTS public.learning_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL,
  base_url text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.learning_sources(id) ON DELETE RESTRICT,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  audience public.learning_audience NOT NULL,
  category text NOT NULL,
  estimated_minutes integer NOT NULL CHECK (estimated_minutes > 0),
  pass_score integer NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.business_team_members(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE RESTRICT,
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),
  score integer NULL CHECK (score BETWEEN 0 AND 100),
  status public.completion_status NOT NULL DEFAULT 'PENDING',
  evidence_url text NULL,
  validated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Badges domain
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL,
  description text NOT NULL,
  icon_key text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.badge_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  requirement_type text NOT NULL,
  requirement_payload jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  status public.badge_status NOT NULL DEFAULT 'IN_PROGRESS',
  progress_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  awarded_at timestamptz NULL,
  expires_at timestamptz NULL,
  revoked_reason text NULL,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.badge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_badge_id uuid NOT NULL REFERENCES public.business_badges(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Public directory domain
CREATE TABLE IF NOT EXISTS public.directory_profiles (
  business_id uuid PRIMARY KEY REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  public_name text NOT NULL,
  short_description text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}'::text[],
  badge_codes text[] NOT NULL DEFAULT '{}'::text[],
  city text NULL,
  state text NULL,
  public_score numeric(8,5) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.directory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_owner
  ON public.business_profiles (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_business_profiles_status
  ON public.business_profiles (status);

CREATE INDEX IF NOT EXISTS idx_business_profiles_public
  ON public.business_profiles (is_public)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_learning_modules_audience
  ON public.learning_modules (audience);

CREATE INDEX IF NOT EXISTS idx_learning_completions_business
  ON public.learning_completions (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_completions_member
  ON public.learning_completions (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_completions_module
  ON public.learning_completions (module_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_badges_business
  ON public.business_badges (business_id, status);

CREATE INDEX IF NOT EXISTS idx_directory_profiles_score
  ON public.directory_profiles (public_score DESC);

CREATE INDEX IF NOT EXISTS idx_directory_profiles_badge_codes
  ON public.directory_profiles USING gin (badge_codes);

CREATE INDEX IF NOT EXISTS idx_directory_events_business
  ON public.directory_events (business_id, occurred_at DESC);

-- 8) Keep updated_at fields synced
DROP TRIGGER IF EXISTS trg_business_profiles_set_updated_at ON public.business_profiles;
CREATE TRIGGER trg_business_profiles_set_updated_at
BEFORE UPDATE ON public.business_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_business_badges_set_updated_at ON public.business_badges;
CREATE TRIGGER trg_business_badges_set_updated_at
BEFORE UPDATE ON public.business_badges
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_directory_profiles_set_updated_at ON public.directory_profiles;
CREATE TRIGGER trg_directory_profiles_set_updated_at
BEFORE UPDATE ON public.directory_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 9) Minimal seed catalogs (idempotent)
INSERT INTO public.roles (code, description)
VALUES ('EMPLEADO_NEGOCIO', 'Empleado operativo de negocio')
ON CONFLICT (code) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.learning_sources (name, source_type, base_url, is_active)
VALUES
  ('Fundacion Coppel', 'FOUNDATION', 'https://www.coppel.com', true),
  ('Proteccion Civil', 'PUBLIC_INSTITUTION', null, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.badge_definitions (code, public_name, description, icon_key, is_active)
VALUES
  ('NEGOCIO_FORMAL', 'Negocio Formal', 'Negocio con evidencia de formalizacion vigente', 'badge-formal', true),
  ('SERVICIO_SEGURO', 'Servicio Seguro', 'Equipo capacitado en servicio y atencion segura', 'badge-safe-service', true),
  ('PAGOS_DIGITALES', 'Acepta Pagos Digitales', 'Negocio capacitado para cobro digital', 'badge-digital-payments', true)
ON CONFLICT (code) DO UPDATE
SET public_name = EXCLUDED.public_name,
    description = EXCLUDED.description,
    icon_key = EXCLUDED.icon_key,
    is_active = EXCLUDED.is_active;
