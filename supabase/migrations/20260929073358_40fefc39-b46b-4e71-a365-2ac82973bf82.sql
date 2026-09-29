CREATE TABLE public.mother_links (
  mother_id uuid PRIMARY KEY REFERENCES public.mothers(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.mother_links TO service_role;
ALTER TABLE public.mother_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access" ON public.mother_links FOR ALL TO authenticated USING (false) WITH CHECK (false);