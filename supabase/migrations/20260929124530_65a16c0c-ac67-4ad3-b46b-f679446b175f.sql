-- lovable-cron-fallback-reviewed: existing time-based reminders/holds job, only repointed to the published URL
ALTER TABLE public.needs_you DROP CONSTRAINT IF EXISTS needs_you_kind_check;
ALTER TABLE public.needs_you ADD CONSTRAINT needs_you_kind_check CHECK (kind IN ('payment_check','third_move','missed_call','refund'));
CREATE UNIQUE INDEX IF NOT EXISTS mothers_email_lower_key ON public.mothers (lower(email));
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS coach_move_options timestamptz[] NOT NULL DEFAULT '{}';
SELECT cron.unschedule('rfm-tick');
SELECT cron.unschedule('rfm-digest');
SELECT cron.schedule('rfm-tick', '*/5 * * * *', $c$ select net.http_post(url:='https://project--8231fb8c-ff69-494f-8d74-3b09d1464059.lovable.app/api/public/hooks/tick', headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select key from public.cron_keys where id=1)), body:='{}'::jsonb); $c$);
SELECT cron.schedule('rfm-digest', '0 2 * * *', $c$ select net.http_post(url:='https://project--8231fb8c-ff69-494f-8d74-3b09d1464059.lovable.app/api/public/hooks/digest', headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select key from public.cron_keys where id=1)), body:='{}'::jsonb); $c$);