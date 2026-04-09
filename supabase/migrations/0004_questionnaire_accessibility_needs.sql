-- 0004_questionnaire_accessibility_needs.sql
-- Agrega campo de necesidades de accesibilidad para cuestionarios de turista y de negocio.

ALTER TABLE IF EXISTS public.tourist_questionnaires
ADD COLUMN IF NOT EXISTS accessibility_needs text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE IF EXISTS public.business_requests
ADD COLUMN IF NOT EXISTS accessibility_needs text[] NOT NULL DEFAULT '{}'::text[];
