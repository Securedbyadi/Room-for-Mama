ALTER TABLE public.mothers ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT true;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT true;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT true;
UPDATE public.mothers SET is_demo = true; UPDATE public.calls SET is_demo = true; UPDATE public.plans SET is_demo = true; UPDATE public.waitlist SET is_demo = true;

UPDATE public.settings SET
  meet_link = 'https://meet.google.com/demo-only-link',
  payment = '{"bank": "DEMO ONLY: Demo Bank, account 0000 0000 0000", "raast": "DEMO ONLY: raast-demo-0000", "jazzcash": "DEMO ONLY: 0300 0000000", "wise": "DEMO ONLY: wise.com/pay/demo"}'::jsonb
WHERE id = 1;

CREATE OR REPLACE FUNCTION public.purge_demo_bookings()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m uuid[]; c uuid[]; p uuid[];
BEGIN
  SELECT coalesce(array_agg(id), '{}') INTO m FROM mothers WHERE is_demo;
  SELECT coalesce(array_agg(id), '{}') INTO c FROM calls WHERE is_demo OR mother_id = ANY(m);
  SELECT coalesce(array_agg(id), '{}') INTO p FROM plans WHERE is_demo OR mother_id = ANY(m);
  DELETE FROM needs_you WHERE mother_id = ANY(m) OR call_id = ANY(c) OR plan_id = ANY(p);
  DELETE FROM move_log WHERE call_id = ANY(c);
  DELETE FROM email_outbox WHERE mother_id = ANY(m);
  DELETE FROM automation_log WHERE mother_id = ANY(m);
  DELETE FROM private_notes WHERE mother_id = ANY(m);
  DELETE FROM mother_links WHERE mother_id = ANY(m);
  UPDATE calls SET replaces_call_id = NULL WHERE replaces_call_id = ANY(c);
  DELETE FROM calls WHERE id = ANY(c);
  DELETE FROM plans WHERE id = ANY(p);
  DELETE FROM mothers WHERE id = ANY(m);
  DELETE FROM waitlist WHERE is_demo;
  DELETE FROM booking_attempts WHERE created_at < now() - interval '1 day';
END; $$;
REVOKE ALL ON FUNCTION public.purge_demo_bookings() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('rfm-demo-purge') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'rfm-demo-purge');
SELECT cron.schedule('rfm-demo-purge', '0 21 * * *', $c$ select public.purge_demo_bookings(); $c$);