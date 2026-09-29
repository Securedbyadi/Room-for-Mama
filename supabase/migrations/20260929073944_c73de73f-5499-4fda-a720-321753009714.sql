CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE TABLE public.cron_keys (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  key text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex')
);
GRANT ALL ON public.cron_keys TO service_role;
ALTER TABLE public.cron_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access" ON public.cron_keys FOR ALL TO authenticated USING (false) WITH CHECK (false);
INSERT INTO public.cron_keys (id) VALUES (1);