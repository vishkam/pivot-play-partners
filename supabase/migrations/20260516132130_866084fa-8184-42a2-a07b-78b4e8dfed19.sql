
-- Enums
CREATE TYPE public.contract_status AS ENUM (
  'draft','pending_signature','signed','active','completed','cancelled'
);
CREATE TYPE public.payment_status AS ENUM (
  'pending','escrow','released','refunded','failed'
);
CREATE TYPE public.dispute_status AS ENUM (
  'open','in_review','resolved','rejected'
);

-- Extend proposal_status enum
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'counter_offered';
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'completed';

-- Add threading columns to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS proposal_id uuid,
  ADD COLUMN IF NOT EXISTS contract_id uuid,
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS system_event text;
CREATE INDEX IF NOT EXISTS messages_proposal_idx ON public.messages(proposal_id);
CREATE INDEX IF NOT EXISTS messages_contract_idx ON public.messages(contract_id);

-- Contracts
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid,
  campaign_id uuid,
  athlete_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  title text NOT NULL,
  deliverables text,
  compensation_amount integer NOT NULL DEFAULT 0,
  platform_fee_pct integer NOT NULL DEFAULT 10,
  timeline text,
  usage_rights text,
  exclusivity text,
  cancellation_terms text,
  payment_schedule text,
  plain_summary text,
  status public.contract_status NOT NULL DEFAULT 'draft',
  signed_by_brand_at timestamptz,
  signed_by_athlete_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contract parties view" ON public.contracts FOR SELECT TO authenticated
  USING (athlete_id = auth.uid() OR brand_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Brands create contracts" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Parties update contracts" ON public.contracts FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid() OR brand_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (athlete_id = auth.uid() OR brand_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete contracts" ON public.contracts FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  amount integer NOT NULL,
  platform_fee integer NOT NULL DEFAULT 0,
  athlete_payout integer NOT NULL DEFAULT 0,
  milestone_label text,
  due_date date,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment parties view" ON public.payments FOR SELECT TO authenticated
  USING (athlete_id = auth.uid() OR brand_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Brands manage payments" ON public.payments FOR ALL TO authenticated
  USING (brand_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (brand_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Pricing profiles (rate card)
CREATE TABLE public.pricing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL,
  package_type text NOT NULL, -- sponsored_post, ambassador, appearance, affiliate, equity, long_term
  description text,
  price_min integer,
  price_max integer,
  unit text DEFAULT 'flat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pricing viewable by authenticated" ON public.pricing_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Athletes manage own pricing" ON public.pricing_profiles FOR ALL TO authenticated
  USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Admins manage pricing" ON public.pricing_profiles FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pricing_updated BEFORE UPDATE ON public.pricing_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Disputes
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid,
  proposal_id uuid,
  reporter_id uuid NOT NULL,
  target_user_id uuid,
  reason text NOT NULL,
  details text,
  status public.dispute_status NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporter views own" ON public.disputes FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "Users file disputes" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins manage disputes" ON public.disputes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_disputes_updated BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  reviewer_role public.app_role NOT NULL,
  professionalism integer NOT NULL CHECK (professionalism BETWEEN 1 AND 5),
  communication integer NOT NULL CHECK (communication BETWEEN 1 AND 5),
  reliability integer NOT NULL CHECK (reliability BETWEEN 1 AND 5),
  campaign_success integer NOT NULL CHECK (campaign_success BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Parties create reviews" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "System inserts notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Trust flags
CREATE TABLE public.trust_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  flag_type text NOT NULL, -- verified, top_partner, fraud_risk, new
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trust flags viewable" ON public.trust_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage flags" ON public.trust_flags FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Allow message threading via proposal/contract - update messages policy to allow seeing thread messages where you're a party of the proposal/contract
-- Existing policy already allows sender/recipient. Keep simple.
