-- MexGo Hackathon - Smoke Test 0006 (learning business only and remove badges)
-- Run after:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql
--   3) 0003_requests_tourist_ops_and_support.sql
--   4) 0004_questionnaire_accessibility_needs.sql
--   5) 0005_remove_admin_and_auto_business_registration.sql
--   6) 0006_learning_business_only_and_remove_badges.sql

-- 1) New aggregated progress table exists
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'business_learning_progress'
) AS business_learning_progress_exists;

-- 2) learning_completions no longer has member_id
SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'learning_completions'
    AND column_name = 'member_id'
) AS learning_completions_member_id_removed;

-- 3) learning_completions has recorded_by_user_id
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'learning_completions'
    AND column_name = 'recorded_by_user_id'
) AS learning_completions_has_recorded_by_user_id;

-- 4) Badge domain tables were removed
SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'badge_events'
) AS badge_events_removed;

SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'business_badges'
) AS business_badges_removed;

SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'badge_requirements'
) AS badge_requirements_removed;

SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'badge_definitions'
) AS badge_definitions_removed;

-- 5) badge_status enum was removed
SELECT NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
    AND t.typname = 'badge_status'
) AS badge_status_type_removed;

-- 6) directory_profiles no longer has badge_codes
SELECT NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'directory_profiles'
    AND column_name = 'badge_codes'
) AS directory_profiles_badge_codes_removed;
