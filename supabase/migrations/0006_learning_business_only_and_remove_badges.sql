-- MexGo Hackathon - Incremental Schema v6
-- Scope: aprendizaje enfocado en negocio y retiro de insignias
-- Depends on:
--   1) 0002_business_learning_badges_directory.sql
--   2) 0005_remove_admin_and_auto_business_registration.sql

-- 1) Crear tabla de progreso por negocio y modulo
CREATE TABLE IF NOT EXISTS public.business_learning_progress (
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status public.completion_status NOT NULL DEFAULT 'PENDING',
  attempts_count integer NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  best_score integer NULL CHECK (best_score BETWEEN 0 AND 100),
  last_score integer NULL CHECK (last_score BETWEEN 0 AND 100),
  last_attempt_at timestamptz NULL,
  completed_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_business_learning_progress_business
  ON public.business_learning_progress (business_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_learning_progress_module
  ON public.business_learning_progress (module_id, updated_at DESC);

DROP TRIGGER IF EXISTS trg_business_learning_progress_set_updated_at ON public.business_learning_progress;
CREATE TRIGGER trg_business_learning_progress_set_updated_at
BEFORE UPDATE ON public.business_learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2) Migrar historial de completitud actual a progreso agregado por negocio
WITH completion_rollup AS (
  SELECT
    lc.business_id,
    lc.module_id,
    GREATEST(
      COALESCE(MAX(lc.score), 0),
      CASE
        WHEN bool_or(lc.status IN ('PASSED', 'VALIDATED')) THEN 100
        ELSE 0
      END
    ) AS progress_percent,
    CASE
      WHEN bool_or(lc.status = 'VALIDATED') THEN 'VALIDATED'::public.completion_status
      WHEN bool_or(lc.status = 'PASSED') THEN 'PASSED'::public.completion_status
      WHEN bool_or(lc.status = 'FAILED') THEN 'FAILED'::public.completion_status
      ELSE 'PENDING'::public.completion_status
    END AS status,
    COUNT(*)::integer AS attempts_count,
    MAX(lc.score) FILTER (WHERE lc.score IS NOT NULL) AS best_score,
    (
      ARRAY_REMOVE(ARRAY_AGG(lc.score ORDER BY lc.created_at DESC), NULL)
    )[1] AS last_score,
    MAX(lc.created_at) AS last_attempt_at,
    MAX(lc.validated_at) AS completed_at
  FROM public.learning_completions lc
  GROUP BY lc.business_id, lc.module_id
)
INSERT INTO public.business_learning_progress (
  business_id,
  module_id,
  progress_percent,
  status,
  attempts_count,
  best_score,
  last_score,
  last_attempt_at,
  completed_at
)
SELECT
  business_id,
  module_id,
  progress_percent,
  status,
  attempts_count,
  best_score,
  last_score,
  last_attempt_at,
  completed_at
FROM completion_rollup
ON CONFLICT (business_id, module_id)
DO UPDATE SET
  progress_percent = EXCLUDED.progress_percent,
  status = EXCLUDED.status,
  attempts_count = EXCLUDED.attempts_count,
  best_score = EXCLUDED.best_score,
  last_score = EXCLUDED.last_score,
  last_attempt_at = EXCLUDED.last_attempt_at,
  completed_at = EXCLUDED.completed_at,
  updated_at = now();

-- 3) Ajustar learning_completions para registro por negocio (sin member_id)
ALTER TABLE public.learning_completions
  DROP CONSTRAINT IF EXISTS learning_completions_member_id_fkey;

ALTER TABLE public.learning_completions
  DROP COLUMN IF EXISTS member_id;

ALTER TABLE public.learning_completions
  ADD COLUMN IF NOT EXISTS recorded_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_learning_completions_member;

-- 4) Retiro del dominio de insignias
DROP TRIGGER IF EXISTS trg_business_badges_set_updated_at ON public.business_badges;

DROP TABLE IF EXISTS public.badge_events;
DROP TABLE IF EXISTS public.business_badges;
DROP TABLE IF EXISTS public.badge_requirements;
DROP TABLE IF EXISTS public.badge_definitions;

DROP TYPE IF EXISTS public.badge_status;

-- 5) Limpiar directorio de campos/filtros de insignias
DROP INDEX IF EXISTS idx_directory_profiles_badge_codes;

ALTER TABLE public.directory_profiles
  DROP COLUMN IF EXISTS badge_codes;
