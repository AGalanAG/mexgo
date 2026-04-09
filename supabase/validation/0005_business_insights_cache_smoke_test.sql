-- MexGo Hackathon - Smoke Test 0005 (Business Insights Cache)
-- Run after:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql
--   3) 0003_requests_tourist_ops_and_support.sql
--   4) 0004_questionnaire_accessibility_needs.sql
--   5) 0005_business_insights_cache.sql

-- 1) Structural checks (tabla)
SELECT to_regclass('public.business_insights_cache') AS business_insights_cache_table;

-- 2) Column checks
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'business_insights_cache'
      AND column_name  = 'business_id'
  ) AS has_business_id,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'business_insights_cache'
      AND column_name  = 'insight_payload'
  ) AS has_insight_payload,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'business_insights_cache'
      AND column_name  = 'context_hash'
  ) AS has_context_hash,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'business_insights_cache'
      AND column_name  = 'generated_at'
  ) AS has_generated_at,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'business_insights_cache'
      AND column_name  = 'is_stale'
  ) AS has_is_stale;

-- 3) Index checks
SELECT
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'business_insights_cache'
      AND indexname  = 'idx_business_insights_cache_generated_at'
  ) AS idx_generated_at_exists,
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'business_insights_cache'
      AND indexname  = 'idx_business_insights_cache_stale'
  ) AS idx_stale_exists,
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'tourist_questionnaires'
      AND indexname  = 'idx_tourist_questionnaires_borough_created'
  ) AS idx_tourist_borough_exists;

-- 4) Functional smoke test
DO $$
DECLARE
  v_business_id uuid;
  v_owner_id    uuid;
  v_cache_id    uuid;
BEGIN
  SELECT id INTO v_owner_id FROM auth.users LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE NOTICE 'Smoke test partial: no users in auth.users, skipping write checks.';
    RETURN;
  END IF;

  -- Buscar un negocio existente (del smoke test de 0002 o cualquiera)
  SELECT id INTO v_business_id
  FROM public.business_profiles
  WHERE owner_user_id = v_owner_id
  LIMIT 1;

  IF v_business_id IS NULL THEN
    -- Crear uno minimo para la prueba
    INSERT INTO public.business_profiles (
      owner_user_id, business_name, business_description, category_code, status, is_public
    ) VALUES (
      v_owner_id, 'Cache Smoke Negocio', 'Negocio para smoke test 0005', 'TEST', 'DRAFT', false
    )
    RETURNING id INTO v_business_id;
  END IF;

  -- Insertar cache de prueba
  INSERT INTO public.business_insights_cache (
    business_id,
    insight_payload,
    context_hash,
    generated_at,
    is_stale
  ) VALUES (
    v_business_id,
    '{"resumen": "Smoke test insight", "alertas": [], "oportunidades": [], "cursos_recomendados": []}'::jsonb,
    'smoke_hash_0005',
    now(),
    false
  )
  ON CONFLICT (business_id) DO UPDATE
    SET insight_payload = EXCLUDED.insight_payload,
        context_hash    = EXCLUDED.context_hash,
        generated_at    = EXCLUDED.generated_at,
        is_stale        = EXCLUDED.is_stale;

  -- Verificar lectura
  SELECT business_id INTO v_cache_id
  FROM public.business_insights_cache
  WHERE business_id = v_business_id;

  IF v_cache_id IS NULL THEN
    RAISE EXCEPTION 'Smoke test 0005 FAILED: no se pudo leer el cache recien insertado.';
  END IF;

  -- Marcar stale y verificar
  UPDATE public.business_insights_cache
  SET is_stale = true
  WHERE business_id = v_business_id;

  IF NOT EXISTS (
    SELECT 1 FROM public.business_insights_cache
    WHERE business_id = v_business_id AND is_stale = true
  ) THEN
    RAISE EXCEPTION 'Smoke test 0005 FAILED: is_stale update no funciono.';
  END IF;

  RAISE NOTICE 'Smoke test 0005 completado OK para business_id: %', v_business_id;
END
$$;

-- 5) Post-run summary
SELECT
  (SELECT COUNT(*) FROM public.business_insights_cache) AS cache_rows,
  (SELECT COUNT(*) FROM public.business_insights_cache WHERE is_stale = false) AS cache_fresh,
  (SELECT COUNT(*) FROM public.business_insights_cache WHERE is_stale = true)  AS cache_stale;
