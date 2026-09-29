-- BEFORE LAUNCH: set is_demo defaults to false on mothers/calls/plans/waitlist and unschedule 'rfm-demo-purge'.
CREATE OR REPLACE FUNCTION public.purge_demo_bookings()
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m uuid[]; c uuid[]; p uuid[];
BEGIN
  SELECT coalesce(array_agg(id), '{}') INTO m FROM mothers WHERE is_demo;
  SELECT coalesce(array_agg(id), '{}') INTO c FROM calls WHERE is_demo OR mother_id = ANY(m);
  SELECT coalesce(array_agg(id), '{}') INTO p FROM plans WHERE is_demo OR mother_id = ANY(m);
  DELETE FROM needs_you WHERE mother_id = ANY(m) OR call_id = ANY(c) OR plan_id = ANY(p);
  DELETE FROM move_log WHERE call_id = ANY(c);
  DELETE FROM email_outbox WHERE mother_id = ANY(m);
  DELETE FROM email_outbox WHERE mother_id IS NULL AND kind = 'digest';
  DELETE FROM automation_log WHERE mother_id = ANY(m);
  DELETE FROM private_notes WHERE mother_id = ANY(m);
  DELETE FROM mother_links WHERE mother_id = ANY(m);
  UPDATE calls SET replaces_call_id = NULL WHERE replaces_call_id = ANY(c);
  DELETE FROM calls WHERE id = ANY(c);
  DELETE FROM plans WHERE id = ANY(p);
  DELETE FROM mothers WHERE id = ANY(m);
  DELETE FROM waitlist WHERE is_demo;
  DELETE FROM booking_attempts WHERE created_at < now() - interval '1 day';
END; $function$;
REVOKE ALL ON FUNCTION public.purge_demo_bookings() FROM PUBLIC, anon, authenticated;