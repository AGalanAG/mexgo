-- MexGo Hackathon - Incremental Schema v3
-- Scope: solicitudes de negocio, operacion turista persistente, soporte admin/superadmin
-- Depends on:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql

-- 1) New enums (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'business_request_status'
  ) THEN
    CREATE TYPE public.business_request_status AS ENUM (
      'PENDIENTE',
      'EN_REVISION',
      'RECHAZADO',
      'APROBADO'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'request_review_action'
  ) THEN
    CREATE TYPE public.request_review_action AS ENUM (
      'CLAIM',
      'RELEASE',
      'APPROVE',
      'REJECT',
      'RESUBMIT'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'ticket_status'
  ) THEN
    CREATE TYPE public.ticket_status AS ENUM (
      'OPEN',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'visit_event_type'
  ) THEN
    CREATE TYPE public.visit_event_type AS ENUM (
      'VIEW',
      'CLICK_DIRECTIONS',
      'CHECKIN',
      'PURCHASE_CONFIRMED'
    );
  END IF;
END
$$;

-- 2) Role helper functions for auth checks in SQL and RLS
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role_code public.role_code)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND r.code = p_role_code
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.has_role(p_user_id, 'ADMIN') OR public.has_role(p_user_id, 'SUPERADMIN');
$$;

-- 3) Business request workflow (owner/admin)
CREATE TABLE IF NOT EXISTS public.business_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  owner_full_name text NOT NULL,
  owner_age integer NOT NULL CHECK (owner_age >= 18 AND owner_age <= 120),
  owner_gender text NOT NULL,
  owner_email text NOT NULL,
  owner_whatsapp text NOT NULL,
  borough_code text NOT NULL,
  neighborhood text NOT NULL,
  google_maps_url text NULL,
  latitude numeric(9,6) NULL,
  longitude numeric(9,6) NULL,
  geocode_source text NULL,
  geocode_confidence numeric(5,4) NULL CHECK (geocode_confidence IS NULL OR (geocode_confidence >= 0 AND geocode_confidence <= 1)),
  training_campus_hint text NULL,
  employees_women_count integer NOT NULL DEFAULT 0 CHECK (employees_women_count >= 0),
  employees_men_count integer NOT NULL DEFAULT 0 CHECK (employees_men_count >= 0),
  business_name text NOT NULL,
  business_description text NOT NULL,
  business_start_range text NOT NULL,
  continuous_operation_time text NOT NULL,
  operation_days_hours text NOT NULL,
  operation_modes text[] NOT NULL DEFAULT '{}'::text[],
  operation_modes_other text NULL,
  sat_status text NOT NULL,
  social_links text[] NOT NULL DEFAULT '{}'::text[],
  adaptation_for_world_cup text NOT NULL,
  support_usage text NOT NULL,
  training_campus_preference text NOT NULL,
  additional_comments text NULL,
  status public.business_request_status NOT NULL DEFAULT 'PENDIENTE',
  current_lock_admin_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  lock_acquired_at timestamptz NULL,
  lock_expires_at timestamptz NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_business_id uuid NULL REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  CONSTRAINT chk_business_requests_latlng_pair CHECK (
    (latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.business_request_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.business_requests(id) ON DELETE CASCADE,
  action public.request_review_action NOT NULL,
  actor_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_review_feedback_on_reject CHECK (
    action <> 'REJECT' OR (feedback IS NOT NULL AND length(btrim(feedback)) > 0)
  )
);

-- 4) Tourist onboarding + recommendations + itineraries
CREATE TABLE IF NOT EXISTS public.tourist_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country text NULL,
  companions_count text NULL,
  is_adult text NULL,
  stay_duration text NULL,
  city text NULL,
  borough text NULL,
  trip_motives text[] NOT NULL DEFAULT '{}'::text[],
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id uuid NULL REFERENCES public.tourist_questionnaires(id) ON DELETE SET NULL,
  context_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recommendation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 6),
  score numeric(8,5) NOT NULL,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_walk_minutes integer NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recommendation_id, rank)
);

CREATE TABLE IF NOT EXISTS public.itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id uuid NULL REFERENCES public.recommendations(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('draft', 'saved', 'archived')) DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  itinerary_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.itinerary_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  route_date date NOT NULL,
  stop_order integer NOT NULL CHECK (stop_order >= 1),
  stop_type text NOT NULL CHECK (stop_type IN ('BUSINESS', 'POI', 'MATCH', 'CUSTOM')),
  business_profile_id uuid NULL REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  label text NOT NULL,
  start_time time NULL,
  end_time time NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (itinerary_id, route_date, stop_order)
);

CREATE TABLE IF NOT EXISTS public.itinerary_daily_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  route_date date NOT NULL,
  provider text NOT NULL DEFAULT 'mapbox-directions',
  profile text NOT NULL CHECK (profile IN ('walking', 'driving')) DEFAULT 'walking',
  waypoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  route_geometry jsonb NOT NULL DEFAULT '{}'::jsonb,
  distance_meters integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  is_stale boolean NOT NULL DEFAULT false,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (itinerary_id, route_date, profile)
);

-- 5) Visits + saturation aggregate for equity
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  recommendation_id uuid NULL REFERENCES public.recommendations(id) ON DELETE SET NULL,
  itinerary_id uuid NULL REFERENCES public.itineraries(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('itinerary', 'map', 'card')),
  event_type public.visit_event_type NOT NULL,
  occurred_at timestamptz NOT NULL,
  local_day date NOT NULL,
  lat numeric(9,6) NULL,
  lng numeric(9,6) NULL,
  counted_for_equity boolean NOT NULL DEFAULT true,
  dedupe_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_business_saturation (
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  day date NOT NULL,
  visits_count integer NOT NULL DEFAULT 0,
  unique_tourists_count integer NOT NULL DEFAULT 0,
  last_referred_at timestamptz NULL,
  saturation_score numeric(8,5) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_profile_id, day)
);

CREATE OR REPLACE FUNCTION public.refresh_daily_business_saturation_from_visit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_unique_tourists integer;
BEGIN
  IF NEW.counted_for_equity IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(DISTINCT tourist_user_id)
  INTO v_unique_tourists
  FROM public.visits
  WHERE business_profile_id = NEW.business_profile_id
    AND local_day = NEW.local_day
    AND counted_for_equity = true;

  INSERT INTO public.daily_business_saturation (
    business_profile_id,
    day,
    visits_count,
    unique_tourists_count,
    last_referred_at,
    saturation_score,
    updated_at
  ) VALUES (
    NEW.business_profile_id,
    NEW.local_day,
    1,
    COALESCE(v_unique_tourists, 0),
    NEW.occurred_at,
    0,
    now()
  )
  ON CONFLICT (business_profile_id, day)
  DO UPDATE SET
    visits_count = public.daily_business_saturation.visits_count + 1,
    unique_tourists_count = COALESCE(v_unique_tourists, public.daily_business_saturation.unique_tourists_count),
    last_referred_at = GREATEST(
      COALESCE(public.daily_business_saturation.last_referred_at, EXCLUDED.last_referred_at),
      EXCLUDED.last_referred_at
    ),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visits_refresh_daily_saturation ON public.visits;
CREATE TRIGGER trg_visits_refresh_daily_saturation
AFTER INSERT ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.refresh_daily_business_saturation_from_visit();

-- 6) Chat persistence
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'model')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Support domain (admin/superadmin)
CREATE TABLE IF NOT EXISTS public.technical_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status public.ticket_status NOT NULL DEFAULT 'OPEN',
  opened_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_to_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  actor_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  before_data jsonb NULL,
  after_data jsonb NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Useful indexes
CREATE INDEX IF NOT EXISTS idx_business_requests_owner_status
  ON public.business_requests (owner_user_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_requests_status_submitted
  ON public.business_requests (status, submitted_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_business_requests_owner_active
  ON public.business_requests (owner_user_id)
  WHERE status IN ('PENDIENTE', 'EN_REVISION');

CREATE INDEX IF NOT EXISTS idx_business_request_reviews_request
  ON public.business_request_reviews (request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tourist_questionnaires_user
  ON public.tourist_questionnaires (tourist_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_user
  ON public.recommendations (tourist_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_items_recommendation
  ON public.recommendation_items (recommendation_id, rank);

CREATE INDEX IF NOT EXISTS idx_recommendation_items_business
  ON public.recommendation_items (business_profile_id);

CREATE INDEX IF NOT EXISTS idx_itineraries_user
  ON public.itineraries (tourist_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_itinerary_stops_itinerary_day
  ON public.itinerary_stops (itinerary_id, route_date, stop_order);

CREATE INDEX IF NOT EXISTS idx_itinerary_daily_routes_itinerary
  ON public.itinerary_daily_routes (itinerary_id, route_date);

CREATE INDEX IF NOT EXISTS idx_visits_business_day
  ON public.visits (business_profile_id, local_day);

CREATE INDEX IF NOT EXISTS idx_visits_business_occurred
  ON public.visits (business_profile_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_visits_tourist_day
  ON public.visits (tourist_user_id, local_day);

CREATE INDEX IF NOT EXISTS idx_daily_saturation_day
  ON public.daily_business_saturation (day, saturation_score DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user
  ON public.chat_sessions (tourist_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON public.chat_messages (session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_technical_tickets_status
  ON public.technical_tickets (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_technical_tickets_assigned
  ON public.technical_tickets (assigned_to_user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON public.audit_logs (actor_user_id, created_at DESC);

-- 9) Keep updated_at fields in sync
DROP TRIGGER IF EXISTS trg_business_requests_set_updated_at ON public.business_requests;
CREATE TRIGGER trg_business_requests_set_updated_at
BEFORE UPDATE ON public.business_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tourist_questionnaires_set_updated_at ON public.tourist_questionnaires;
CREATE TRIGGER trg_tourist_questionnaires_set_updated_at
BEFORE UPDATE ON public.tourist_questionnaires
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_itineraries_set_updated_at ON public.itineraries;
CREATE TRIGGER trg_itineraries_set_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_itinerary_daily_routes_set_updated_at ON public.itinerary_daily_routes;
CREATE TRIGGER trg_itinerary_daily_routes_set_updated_at
BEFORE UPDATE ON public.itinerary_daily_routes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_chat_sessions_set_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_set_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_technical_tickets_set_updated_at ON public.technical_tickets;
CREATE TRIGGER trg_technical_tickets_set_updated_at
BEFORE UPDATE ON public.technical_tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_daily_business_saturation_set_updated_at ON public.daily_business_saturation;
CREATE TRIGGER trg_daily_business_saturation_set_updated_at
BEFORE UPDATE ON public.daily_business_saturation
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
