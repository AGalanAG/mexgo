-- MexGo Hackathon - Business Insights Cache
-- Scope: cache de informes Gemini por negocio con TTL
-- Depends on: 0002_business_learning_badges_directory.sql

-- Tabla principal de cache
CREATE TABLE IF NOT EXISTS public.business_insights_cache (
  business_id     uuid        PRIMARY KEY
                              REFERENCES public.business_profiles(id)
                              ON DELETE CASCADE,
  insight_payload jsonb       NOT NULL DEFAULT '{}'::jsonb,
  context_hash    text        NOT NULL DEFAULT '',
  generated_at    timestamptz NOT NULL DEFAULT now(),
  is_stale        boolean     NOT NULL DEFAULT false
);

COMMENT ON TABLE public.business_insights_cache IS
  'Cache de informes Gemini por negocio. TTL manejado en aplicacion (6h).';

COMMENT ON COLUMN public.business_insights_cache.context_hash IS
  'Hash MD5 del contexto enviado a Gemini. Detecta si los datos cambiaron.';

COMMENT ON COLUMN public.business_insights_cache.is_stale IS
  'true si el insight debe regenerarse aunque no haya expirado el TTL.';

-- Indice auxiliar para negocios con cache reciente
CREATE INDEX IF NOT EXISTS idx_business_insights_cache_generated_at
  ON public.business_insights_cache (generated_at DESC);

-- Indice de soporte para borrar cache stale en batch
CREATE INDEX IF NOT EXISTS idx_business_insights_cache_stale
  ON public.business_insights_cache (is_stale)
  WHERE is_stale = true;

-- Indice en tourist_questionnaires por borough + created_at
-- (necesario para la query de turistas en la zona del negocio)
CREATE INDEX IF NOT EXISTS idx_tourist_questionnaires_borough_created
  ON public.tourist_questionnaires (borough, created_at DESC)
  WHERE borough IS NOT NULL;
