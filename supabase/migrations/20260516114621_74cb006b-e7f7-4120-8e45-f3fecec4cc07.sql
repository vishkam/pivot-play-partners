
-- Extra campaign fields
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS product_category text,
  ADD COLUMN IF NOT EXISTS content_deliverables text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Extra proposal fields
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS partnership_type text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS deliverables text,
  ADD COLUMN IF NOT EXISTS athlete_response text;

-- Saved athletes (shortlist)
CREATE TABLE IF NOT EXISTS public.saved_athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, athlete_id)
);
ALTER TABLE public.saved_athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage own shortlist"
  ON public.saved_athletes
  FOR ALL TO authenticated
  USING (brand_id = auth.uid())
  WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Admins view all shortlists"
  ON public.saved_athletes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
