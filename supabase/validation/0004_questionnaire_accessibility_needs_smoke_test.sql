-- MexGo Hackathon - Smoke Test 0004 (questionnaire accessibility needs)
-- Run after:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql
--   3) 0003_requests_tourist_ops_and_support.sql
--   4) 0004_questionnaire_accessibility_needs.sql

SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'tourist_questionnaires'
    AND column_name = 'accessibility_needs'
) AS tourist_questionnaires_has_accessibility_needs;

SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'business_requests'
    AND column_name = 'accessibility_needs'
) AS business_requests_has_accessibility_needs;
