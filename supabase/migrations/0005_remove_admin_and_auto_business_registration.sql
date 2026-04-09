-- MexGo Hackathon - Incremental Schema v5
-- Scope: remover administracion manual y habilitar alta directa de negocios
-- Depends on:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql
--   3) 0003_requests_tourist_ops_and_support.sql

-- 1) Quitar asignaciones de roles administrativos existentes
DELETE FROM public.user_roles
WHERE role_id IN (
  SELECT id
  FROM public.roles
  WHERE code IN ('ADMIN', 'SUPERADMIN')
);

-- 2) Evitar nuevas altas de roles administrativos en catalogo
CREATE OR REPLACE FUNCTION public.prevent_admin_roles_upsert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IN ('ADMIN', 'SUPERADMIN') THEN
    RAISE EXCEPTION 'Los roles ADMIN y SUPERADMIN fueron deshabilitados';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_roles_prevent_admin_roles ON public.roles;
CREATE TRIGGER trg_roles_prevent_admin_roles
BEFORE INSERT OR UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_roles_upsert();

-- 3) Eliminar roles administrativos del catalogo despues de limpiar user_roles
DELETE FROM public.roles
WHERE code IN ('ADMIN', 'SUPERADMIN');

-- 4) Mantener helper heredado sin privilegios (compatibilidad con validaciones antiguas)
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT false;
$$;

-- 5) Habilitar alta de negocios activa por defecto (sin aprobacion administrativa)
ALTER TABLE public.business_profiles
  ALTER COLUMN status SET DEFAULT 'ACTIVE';

UPDATE public.business_profiles
SET status = 'ACTIVE'
WHERE status = 'DRAFT';

-- 6) Retirar campos de bloqueo administrativo del workflow legacy de solicitudes
ALTER TABLE public.business_requests
  DROP COLUMN IF EXISTS current_lock_admin_user_id,
  DROP COLUMN IF EXISTS lock_acquired_at,
  DROP COLUMN IF EXISTS lock_expires_at,
  DROP COLUMN IF EXISTS approved_business_id;

DROP INDEX IF EXISTS ux_business_requests_owner_active;

-- 7) Forzar solicitudes nuevas como aprobadas automaticamente (compatibilidad temporal)
ALTER TABLE public.business_requests
  ALTER COLUMN status SET DEFAULT 'APROBADO';

UPDATE public.business_requests
SET status = 'APROBADO'
WHERE status IN ('PENDIENTE', 'EN_REVISION');

-- 8) Eliminar artefactos de revision administrativa
DROP TABLE IF EXISTS public.business_request_reviews;
DROP TYPE IF EXISTS public.request_review_action;
