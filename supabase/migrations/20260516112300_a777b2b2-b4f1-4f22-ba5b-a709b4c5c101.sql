
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('athlete', 'brand', 'admin');
CREATE TYPE public.verification_status AS ENUM ('pending', 'in_review', 'verified', 'rejected');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'closed');
CREATE TYPE public.proposal_status AS ENUM ('sent', 'viewed', 'accepted', 'declined', 'negotiating');

-- USER ROLES (separate table — never on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'brand' THEN 2 WHEN 'athlete' THEN 3 END
  LIMIT 1
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  country TEXT,
  primary_role app_role,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ATHLETE PROFILES
CREATE TABLE public.athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT,
  discipline TEXT,
  professional_level TEXT,
  team_federation TEXT,
  rankings TEXT,
  achievements TEXT,
  certifications TEXT,
  competition_history TEXT,
  values TEXT[] DEFAULT '{}',
  causes TEXT[] DEFAULT '{}',
  story TEXT,
  sponsorship_categories TEXT[] DEFAULT '{}',
  audience_demographics JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  partnership_types TEXT[] DEFAULT '{}',
  availability TEXT,
  pricing_min INTEGER,
  pricing_max INTEGER,
  geographic_preferences TEXT[] DEFAULT '{}',
  profile_image TEXT,
  media JSONB DEFAULT '[]',
  verification_status verification_status NOT NULL DEFAULT 'pending',
  profile_completeness INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athlete profiles viewable by authenticated" ON public.athlete_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Athletes manage own profile" ON public.athlete_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage athlete profiles" ON public.athlete_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BRAND PROFILES
CREATE TABLE public.brand_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  website TEXT,
  industry TEXT,
  revenue_stage TEXT,
  contact_role TEXT,
  values TEXT[] DEFAULT '{}',
  mission TEXT,
  consumer_demographics JSONB DEFAULT '{}',
  esg_priorities TEXT[] DEFAULT '{}',
  positioning TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand profiles viewable by authenticated" ON public.brand_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brands manage own profile" ON public.brand_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage brand profiles" ON public.brand_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CAMPAIGNS
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  goals TEXT,
  preferred_athlete_types TEXT[] DEFAULT '{}',
  geographic_reach TEXT[] DEFAULT '{}',
  sports TEXT[] DEFAULT '{}',
  partnership_structure TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active campaigns viewable by authenticated" ON public.campaigns
  FOR SELECT TO authenticated
  USING (status = 'active' OR brand_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Brands manage own campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (brand_id = auth.uid())
  WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Admins manage campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- MATCHES
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  values_score INTEGER DEFAULT 0,
  audience_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  sport_score INTEGER DEFAULT 0,
  campaign_score INTEGER DEFAULT 0,
  explanation TEXT,
  saved_by_brand BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match parties view" ON public.matches
  FOR SELECT TO authenticated
  USING (athlete_id = auth.uid() OR brand_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Brands save matches" ON public.matches
  FOR UPDATE TO authenticated USING (brand_id = auth.uid()) WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Admins manage matches" ON public.matches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROPOSALS
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT,
  proposed_amount INTEGER,
  status proposal_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposal parties view" ON public.proposals
  FOR SELECT TO authenticated
  USING (athlete_id = auth.uid() OR brand_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Brands send proposals" ON public.proposals
  FOR INSERT TO authenticated WITH CHECK (brand_id = auth.uid());
CREATE POLICY "Athletes respond" ON public.proposals
  FOR UPDATE TO authenticated USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Message parties view" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- ADMIN ACTIONS
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view actions" ON public.admin_actions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create actions" ON public.admin_actions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- AUTO-CREATE PROFILE & ROLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role app_role;
BEGIN
  selected_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'athlete');

  INSERT INTO public.profiles (id, full_name, email, primary_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    selected_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);

  IF selected_role = 'athlete' THEN
    INSERT INTO public.athlete_profiles (user_id) VALUES (NEW.id);
  ELSIF selected_role = 'brand' THEN
    INSERT INTO public.brand_profiles (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER athlete_profiles_touch BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER brand_profiles_touch BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER campaigns_touch BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
