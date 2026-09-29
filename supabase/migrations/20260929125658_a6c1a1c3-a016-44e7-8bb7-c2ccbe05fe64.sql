ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_status_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_status_check CHECK (status IN ('held','paid_pending','confirmed','released','paused','cancelled','done','refunded'));
UPDATE public.mothers SET email = lower(email) WHERE email <> lower(email);