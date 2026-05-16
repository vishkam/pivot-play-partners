
ALTER TABLE public.athlete_profiles
  ADD COLUMN IF NOT EXISTS favorite_brands text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_products text,
  ADD COLUMN IF NOT EXISTS material_preferences text[] NOT NULL DEFAULT '{}';
