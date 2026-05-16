
ALTER TABLE public.athlete_profiles
  ADD COLUMN IF NOT EXISTS personality text,
  ADD COLUMN IF NOT EXISTS sizing jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS brand_categories jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS legal_notes text,
  ADD COLUMN IF NOT EXISTS ethical_notes text,
  ADD COLUMN IF NOT EXISTS post_deal_strategies text;

-- Allow athletes to apply to open campaigns (insert proposals where they are the athlete)
DROP POLICY IF EXISTS "Athletes apply to campaigns" ON public.proposals;
CREATE POLICY "Athletes apply to campaigns"
  ON public.proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());
