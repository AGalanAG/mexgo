-- Migration to drop support and history tables
-- Removing chat_sessions, chat_messages, technical_tickets, and audit_logs

-- First drop child tables to respect foreign key constraints
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;

-- Drop independent support/history tables
DROP TABLE IF EXISTS public.technical_tickets CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
