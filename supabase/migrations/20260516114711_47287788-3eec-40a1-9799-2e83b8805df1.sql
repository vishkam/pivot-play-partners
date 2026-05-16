
ALTER TABLE public.profiles         DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.athlete_profiles DROP CONSTRAINT IF EXISTS athlete_profiles_user_id_fkey;
ALTER TABLE public.brand_profiles   DROP CONSTRAINT IF EXISTS brand_profiles_user_id_fkey;
ALTER TABLE public.user_roles       DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.campaigns        DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey;
ALTER TABLE public.matches          DROP CONSTRAINT IF EXISTS matches_athlete_id_fkey;
ALTER TABLE public.matches          DROP CONSTRAINT IF EXISTS matches_brand_id_fkey;
ALTER TABLE public.proposals        DROP CONSTRAINT IF EXISTS proposals_athlete_id_fkey;
ALTER TABLE public.proposals        DROP CONSTRAINT IF EXISTS proposals_brand_id_fkey;
ALTER TABLE public.messages         DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages         DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
ALTER TABLE public.admin_actions    DROP CONSTRAINT IF EXISTS admin_actions_admin_id_fkey;
ALTER TABLE public.admin_actions    DROP CONSTRAINT IF EXISTS admin_actions_target_user_id_fkey;
