CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.app_role AS ENUM ('coach');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Settings (single row)
CREATE TABLE public.settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  coach_zone text NOT NULL DEFAULT 'Asia/Karachi',
  windows jsonb NOT NULL DEFAULT '[{"days":[1,2,3,4,5],"start":"14:00","end":"17:00"},{"days":[1,2,3,4,5],"start":"21:00","end":"23:00"}]',
  max_per_day int NOT NULL DEFAULT 3,
  buffer_min int NOT NULL DEFAULT 10,
  notice_new_h int NOT NULL DEFAULT 6,
  notice_move_h int NOT NULL DEFAULT 1,
  weeks_ahead int NOT NULL DEFAULT 6,
  meet_link text NOT NULL DEFAULT 'https://meet.google.com/xxx-xxxx-xxx',
  coach_email text NOT NULL DEFAULT 'hello@roomformama.com',
  payment jsonb NOT NULL DEFAULT '{"bank":"Bank details go here (set in Rules)","raast":"Raast ID goes here","jazzcash":"JazzCash number goes here","wise":"Wise link goes here"}',
  prices jsonb NOT NULL DEFAULT '{"pkr":12000,"usd":120,"founding_pkr":8000,"founding_usd":80,"founding_spots":10}',
  not_a_fit_note text NOT NULL DEFAULT 'Thank you for the hello call. I don''t think Make Room is the right fit for you just now, and I''d rather say so kindly than take your time or money. If you ever want another chat, I''m here.',
  minutes jsonb NOT NULL DEFAULT '{"booked":20,"keep_spot":10,"offer":5,"four_calls":25,"payment":10,"reminder":5,"move":10,"clock_notice":10,"re_offer":10,"digest":15}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach reads settings" ON public.settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'coach'));
CREATE POLICY "coach edits settings" ON public.settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.settings (id) VALUES (1);

-- Helplines
CREATE TABLE public.helplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  zones text[] NOT NULL DEFAULT '{}',
  name text NOT NULL,
  number text NOT NULL,
  hours text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.helplines TO authenticated;
GRANT ALL ON public.helplines TO service_role;
ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages helplines" ON public.helplines FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));
INSERT INTO public.helplines (country, zones, name, number, hours, sort) VALUES
 ('Pakistan','{Asia/Karachi}','Umang','0311 7786264','24 h',1),
 ('Pakistan','{Asia/Karachi}','Emergency','1122',NULL,2),
 ('UK','{Europe/London}','Samaritans','116 123','24 h',1),
 ('UK','{Europe/London}','PANDAS WhatsApp','07903 508334','weekdays 9–5',2),
 ('UK','{Europe/London}','Emergency','999',NULL,3),
 ('UAE','{Asia/Dubai}','National Mental Support Line','800 4673','8 am–8 pm',1),
 ('UAE','{Asia/Dubai}','Emergency','999',NULL,2),
 ('UAE','{Asia/Dubai}','Ambulance','998',NULL,3),
 ('Saudi Arabia','{Asia/Riyadh}','National Center for Mental Health Promotion','920033360','8 am–8 pm',1),
 ('Saudi Arabia','{Asia/Riyadh}','Emergency','911',NULL,2),
 ('US','{America/New_York,America/Chicago,America/Denver,America/Los_Angeles,America/Phoenix,America/Anchorage,Pacific/Honolulu}','National Maternal Mental Health Hotline','1-833-852-6262','24 h, call/text',1),
 ('US','{America/New_York,America/Chicago,America/Denver,America/Los_Angeles,America/Phoenix,America/Anchorage,Pacific/Honolulu}','Crisis line','988',NULL,2),
 ('US','{America/New_York,America/Chicago,America/Denver,America/Los_Angeles,America/Phoenix,America/Anchorage,Pacific/Honolulu}','Emergency','911',NULL,3),
 ('Canada','{America/Toronto,America/Vancouver,America/Edmonton,America/Winnipeg,America/Halifax,America/St_Johns,America/Regina}','Crisis line','988','24 h, call/text',1),
 ('Canada','{America/Toronto,America/Vancouver,America/Edmonton,America/Winnipeg,America/Halifax,America/St_Johns,America/Regina}','Emergency','911',NULL,2);

-- Mothers
CREATE TABLE public.mothers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  zone text NOT NULL,
  city text,
  moment_days int[] NOT NULL DEFAULT '{}',
  moment_not_before text,
  moment_not_after text,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'hello' CHECK (status IN ('hello','offered','not_a_fit','make_room','paused','done')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mothers_email_idx ON public.mothers (lower(email));
GRANT SELECT, UPDATE, DELETE ON public.mothers TO authenticated;
GRANT ALL ON public.mothers TO service_role;
ALTER TABLE public.mothers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages mothers" ON public.mothers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));
CREATE TRIGGER mothers_touch BEFORE UPDATE ON public.mothers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Plans (Make Room)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES public.mothers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held','paid_pending','confirmed','released','paused','cancelled','done')),
  amount int NOT NULL,
  currency text NOT NULL CHECK (currency IN ('PKR','USD')),
  founding boolean NOT NULL DEFAULT false,
  reference text NOT NULL UNIQUE,
  paid_reference text,
  hold_expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));
CREATE TRIGGER plans_touch BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE SEQUENCE public.payment_ref_seq START 1001;
GRANT USAGE ON SEQUENCE public.payment_ref_seq TO service_role;

-- Calls
CREATE TABLE public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES public.mothers(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('hello','make_room')),
  week int,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  blocked_until timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('held','booked','done','missed','cancelled','released')),
  moves_used int NOT NULL DEFAULT 0,
  clock_note text,
  keep_spot_sent_at timestamptz,
  keep_spot_confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  thanks_sent_at timestamptz,
  small_step text CHECK (small_step IS NULL OR char_length(small_step) <= 280),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CONSTRAINT calls_no_double_booking EXCLUDE USING gist (tstzrange(starts_at, blocked_until) WITH &&) WHERE (status IN ('held','booked'))
);
CREATE INDEX calls_starts_idx ON public.calls (starts_at);
CREATE INDEX calls_mother_idx ON public.calls (mother_id);
GRANT SELECT, UPDATE ON public.calls TO authenticated;
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages calls" ON public.calls FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));

CREATE OR REPLACE FUNCTION public.calls_set_block() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE buf int;
BEGIN
  SELECT buffer_min INTO buf FROM public.settings WHERE id = 1;
  NEW.blocked_until = NEW.ends_at + make_interval(mins => COALESCE(buf, 10));
  NEW.updated_at = now();
  RETURN NEW;
END; $$;
CREATE TRIGGER calls_block BEFORE INSERT OR UPDATE ON public.calls FOR EACH ROW EXECUTE FUNCTION public.calls_set_block();

-- Waitlist
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  zone text NOT NULL,
  city text,
  days int[] NOT NULL DEFAULT '{}',
  not_before text,
  not_after text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','offered','done','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages waitlist" ON public.waitlist FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));

-- Move history
CREATE TABLE public.move_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  moved_by text NOT NULL CHECK (moved_by IN ('mother','coach')),
  from_at timestamptz NOT NULL,
  to_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.move_log TO authenticated;
GRANT ALL ON public.move_log TO service_role;
ALTER TABLE public.move_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach reads moves" ON public.move_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'coach'));

-- Needs you
CREATE TABLE public.needs_you (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('payment_check','third_move','missed_call')),
  mother_id uuid REFERENCES public.mothers(id) ON DELETE CASCADE,
  call_id uuid REFERENCES public.calls(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.needs_you TO authenticated;
GRANT ALL ON public.needs_you TO service_role;
ALTER TABLE public.needs_you ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages needs" ON public.needs_you FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));

-- Private notes
CREATE TABLE public.private_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES public.mothers(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_notes TO authenticated;
GRANT ALL ON public.private_notes TO service_role;
ALTER TABLE public.private_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages notes" ON public.private_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'coach')) WITH CHECK (public.has_role(auth.uid(),'coach'));

-- Time given back
CREATE TABLE public.automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  mother_id uuid REFERENCES public.mothers(id) ON DELETE SET NULL,
  minutes_saved int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX automation_log_created_idx ON public.automation_log (created_at DESC);
GRANT SELECT ON public.automation_log TO authenticated;
GRANT ALL ON public.automation_log TO service_role;
ALTER TABLE public.automation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach reads log" ON public.automation_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'coach'));

-- Email preview outbox
CREATE TABLE public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid REFERENCES public.mothers(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  kind text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  action_label text,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_outbox TO authenticated;
GRANT ALL ON public.email_outbox TO service_role;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach reads outbox" ON public.email_outbox FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'coach'));

-- Rate limit ledger
CREATE TABLE public.booking_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_attempts_idx ON public.booking_attempts (created_at DESC);
GRANT ALL ON public.booking_attempts TO service_role;
ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;