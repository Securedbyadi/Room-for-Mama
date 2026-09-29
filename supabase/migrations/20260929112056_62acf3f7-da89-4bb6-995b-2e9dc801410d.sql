-- lovable-cron-fallback-reviewed: reminders, Keep my spot cut-offs and hold expiry are time-based with a 5-minute delivery window; job already existed and is only recorded here
-- Keep plan and payment records when a mother deletes her data.
ALTER TABLE public.plans ALTER COLUMN mother_id DROP NOT NULL;
ALTER TABLE public.plans DROP CONSTRAINT plans_mother_id_fkey;
ALTER TABLE public.plans ADD CONSTRAINT plans_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id) ON DELETE SET NULL;
ALTER TABLE public.needs_you DROP CONSTRAINT needs_you_mother_id_fkey;
ALTER TABLE public.needs_you ADD CONSTRAINT needs_you_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id) ON DELETE SET NULL;

-- Each side gets its own two moves.
ALTER TABLE public.calls ADD COLUMN coach_moves_used integer NOT NULL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN coach_move_pending boolean NOT NULL DEFAULT false;
ALTER TABLE public.calls ADD COLUMN replaces_call_id uuid REFERENCES public.calls(id) ON DELETE SET NULL;

-- Calendar invite stored with each email.
ALTER TABLE public.email_outbox ADD COLUMN ics text;

-- RM references from the sequence.
CREATE OR REPLACE FUNCTION public.next_payment_ref()
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public
AS $$ SELECT 'RM' || nextval('public.payment_ref_seq')::text $$;
REVOKE ALL ON FUNCTION public.next_payment_ref() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_payment_ref() TO service_role;

-- Scheduled jobs, recorded here (the key is read from the service-only table at run time).
DO $$ BEGIN
  PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname IN ('rfm-tick','rfm-digest');
END $$;
SELECT cron.schedule('rfm-tick', '*/5 * * * *', $c$ select net.http_post(url:='https://project--8231fb8c-ff69-494f-8d74-3b09d1464059-dev.lovable.app/api/public/hooks/tick', headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select key from public.cron_keys where id=1)), body:='{}'::jsonb); $c$);
SELECT cron.schedule('rfm-digest', '0 2 * * *', $c$ select net.http_post(url:='https://project--8231fb8c-ff69-494f-8d74-3b09d1464059-dev.lovable.app/api/public/hooks/digest', headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select key from public.cron_keys where id=1)), body:='{}'::jsonb); $c$);