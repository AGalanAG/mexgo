-- MexGo Hackathon - Smoke Test 0003 (Requests + Tourist Ops + Support)
-- Run after:
--   1) 0001_hackathon_identity_rbac.sql
--   2) 0002_business_learning_badges_directory.sql
--   3) 0003_requests_tourist_ops_and_support.sql

-- 1) Structural checks (tables)
SELECT to_regclass('public.business_requests') AS business_requests_table;
SELECT to_regclass('public.business_request_reviews') AS business_request_reviews_table;
SELECT to_regclass('public.tourist_questionnaires') AS tourist_questionnaires_table;
SELECT to_regclass('public.recommendations') AS recommendations_table;
SELECT to_regclass('public.recommendation_items') AS recommendation_items_table;
SELECT to_regclass('public.itineraries') AS itineraries_table;
SELECT to_regclass('public.itinerary_stops') AS itinerary_stops_table;
SELECT to_regclass('public.itinerary_daily_routes') AS itinerary_daily_routes_table;
SELECT to_regclass('public.visits') AS visits_table;
SELECT to_regclass('public.daily_business_saturation') AS daily_business_saturation_table;


-- 2) Enum checks
SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'business_request_status'
) AS business_request_status_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'request_review_action'
) AS request_review_action_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'ticket_status'
) AS ticket_status_enum_exists;

SELECT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typname = 'visit_event_type'
) AS visit_event_type_enum_exists;

-- 3) Helper function checks
SELECT public.has_role(NULL, 'TURISTA') AS has_role_with_null_user_id;
SELECT public.is_admin_or_superadmin(NULL) AS is_admin_or_superadmin_with_null_user_id;

-- 4) Functional smoke test (uses one auth user + one business profile)
DO $$
DECLARE
  v_user_id uuid;
  v_business_id uuid;
  v_request_id uuid;
  v_questionnaire_id uuid;
  v_recommendation_id uuid;
  v_itinerary_id uuid;
  v_session_id uuid;
  v_ticket_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Smoke test partial: no users found in auth.users, skipping write checks.';
    RETURN;
  END IF;

  SELECT id INTO v_business_id
  FROM public.business_profiles
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_business_id IS NULL THEN
    INSERT INTO public.business_profiles (
      owner_user_id,
      business_name,
      business_description,
      category_code,
      status,
      is_public
    ) VALUES (
      v_user_id,
      'Smoke Business 0003',
      'Business fallback for smoke test 0003',
      'SMOKE',
      'DRAFT',
      false
    )
    RETURNING id INTO v_business_id;
  END IF;

  UPDATE public.business_requests
  SET status = 'RECHAZADO',
      updated_at = now()
  WHERE owner_user_id = v_user_id
    AND status IN ('PENDIENTE', 'EN_REVISION');

  INSERT INTO public.business_requests (
    owner_user_id,
    owner_full_name,
    owner_age,
    owner_gender,
    owner_email,
    owner_whatsapp,
    borough_code,
    neighborhood,
    employees_women_count,
    employees_men_count,
    business_name,
    business_description,
    business_start_range,
    continuous_operation_time,
    operation_days_hours,
    operation_modes,
    sat_status,
    social_links,
    adaptation_for_world_cup,
    support_usage,
    training_campus_preference,
    status
  ) VALUES (
    v_user_id,
    'Smoke Owner 0003',
    29,
    'No binario',
    'smoke-0003@example.com',
    '+525500000003',
    'Cuauhtemoc',
    'Centro',
    2,
    1,
    'Smoke Request 0003',
    'Solicitud de prueba',
    'A1_A3',
    '2 anos',
    'Lunes a Viernes 09:00-18:00',
    ARRAY['Local']::text[],
    'EN_PROCESO',
    ARRAY['https://instagram.com/smoke0003']::text[],
    'Promociones para visitantes',
    'Capacitacion y digitalizacion',
    'MIDE',
    'PENDIENTE'
  )
  RETURNING id INTO v_request_id;

  INSERT INTO public.business_request_reviews (
    request_id,
    action,
    actor_user_id,
    feedback,
    metadata
  ) VALUES (
    v_request_id,
    'CLAIM',
    v_user_id,
    'Toma inicial para revision',
    jsonb_build_object('smoke', true)
  );

  INSERT INTO public.tourist_questionnaires (
    tourist_user_id,
    country,
    companions_count,
    is_adult,
    stay_duration,
    city,
    borough,
    trip_motives,
    payload
  ) VALUES (
    v_user_id,
    'MX',
    '2',
    'true',
    '3 dias',
    'CDMX',
    'Cuauhtemoc',
    ARRAY['gastronomia', 'cultura']::text[],
    jsonb_build_object('budget', 'medio')
  )
  RETURNING id INTO v_questionnaire_id;

  INSERT INTO public.recommendations (
    tourist_user_id,
    questionnaire_id,
    context_payload
  ) VALUES (
    v_user_id,
    v_questionnaire_id,
    jsonb_build_object('lat', 19.4326, 'lng', -99.1332)
  )
  RETURNING id INTO v_recommendation_id;

  INSERT INTO public.recommendation_items (
    recommendation_id,
    business_profile_id,
    rank,
    score,
    reasons,
    estimated_walk_minutes
  ) VALUES (
    v_recommendation_id,
    v_business_id,
    1,
    0.98765,
    '[]'::jsonb,
    8
  );

  INSERT INTO public.itineraries (
    tourist_user_id,
    recommendation_id,
    status,
    version,
    itinerary_payload
  ) VALUES (
    v_user_id,
    v_recommendation_id,
    'draft',
    1,
    jsonb_build_object('source', 'smoke')
  )
  RETURNING id INTO v_itinerary_id;

  INSERT INTO public.itinerary_stops (
    itinerary_id,
    route_date,
    stop_order,
    stop_type,
    business_profile_id,
    label,
    start_time,
    latitude,
    longitude
  ) VALUES (
    v_itinerary_id,
    CURRENT_DATE,
    1,
    'BUSINESS',
    v_business_id,
    'Parada Smoke',
    '10:00'::time,
    19.432600,
    -99.133200
  );

  INSERT INTO public.itinerary_daily_routes (
    itinerary_id,
    route_date,
    provider,
    profile,
    waypoints,
    route_geometry,
    distance_meters,
    duration_seconds
  ) VALUES (
    v_itinerary_id,
    CURRENT_DATE,
    'mapbox-directions',
    'walking',
    '[]'::jsonb,
    '{"type":"LineString","coordinates":[]}'::jsonb,
    1500,
    1200
  );

  INSERT INTO public.visits (
    tourist_user_id,
    business_profile_id,
    recommendation_id,
    itinerary_id,
    source,
    event_type,
    occurred_at,
    local_day,
    lat,
    lng,
    counted_for_equity,
    dedupe_key
  ) VALUES (
    v_user_id,
    v_business_id,
    v_recommendation_id,
    v_itinerary_id,
    'itinerary',
    'VIEW',
    now(),
    CURRENT_DATE,
    19.432600,
    -99.133200,
    true,
    'smoke-0003-' || gen_random_uuid()::text
  );

  INSERT INTO public.chat_sessions (
    tourist_user_id
  ) VALUES (
    v_user_id
  )
  RETURNING id INTO v_session_id;

  INSERT INTO public.chat_messages (
    session_id,
    role,
    content
  ) VALUES (
    v_session_id,
    'user',
    'Mensaje smoke test 0003'
  );

  INSERT INTO public.technical_tickets (
    title,
    description,
    severity,
    status,
    opened_by_user_id,
    assigned_to_user_id,
    resolution_notes
  ) VALUES (
    'Smoke ticket 0003',
    'Ticket de validacion de esquema',
    'medium',
    'OPEN',
    v_user_id,
    v_user_id,
    NULL
  )
  RETURNING id INTO v_ticket_id;

  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    actor_user_id,
    before_data,
    after_data,
    metadata
  ) VALUES (
    'technical_ticket',
    v_ticket_id,
    'CREATE',
    v_user_id,
    NULL,
    jsonb_build_object('status', 'OPEN'),
    jsonb_build_object('source', 'smoke_test_0003')
  );

  RAISE NOTICE 'Smoke test 0003 write operations completed for user: %', v_user_id;
END
$$;

-- 5) Post-run summary
SELECT
  (SELECT COUNT(*) FROM public.business_requests) AS business_requests_count,
  (SELECT COUNT(*) FROM public.business_request_reviews) AS business_request_reviews_count,
  (SELECT COUNT(*) FROM public.tourist_questionnaires) AS tourist_questionnaires_count,
  (SELECT COUNT(*) FROM public.recommendations) AS recommendations_count,
  (SELECT COUNT(*) FROM public.recommendation_items) AS recommendation_items_count,
  (SELECT COUNT(*) FROM public.itineraries) AS itineraries_count,
  (SELECT COUNT(*) FROM public.itinerary_stops) AS itinerary_stops_count,
  (SELECT COUNT(*) FROM public.itinerary_daily_routes) AS itinerary_daily_routes_count,
  (SELECT COUNT(*) FROM public.visits) AS visits_count,
  (SELECT COUNT(*) FROM public.daily_business_saturation) AS daily_business_saturation_count,
  (SELECT COUNT(*) FROM public.chat_sessions) AS chat_sessions_count,
  (SELECT COUNT(*) FROM public.chat_messages) AS chat_messages_count,
  (SELECT COUNT(*) FROM public.technical_tickets) AS technical_tickets_count,
  (SELECT COUNT(*) FROM public.audit_logs) AS audit_logs_count;
