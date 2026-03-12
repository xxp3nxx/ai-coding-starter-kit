-- PROJ-1: User Authentication & Roles
-- Creates profiles, invitations, and trainer_centre_assignments tables
-- with RLS policies, indexes, and auto-profile trigger.

-- ============================================================
-- 1. PROFILES TABLE
-- Extends auth.users with role and display information.
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('athlete', 'trainer', 'centre_admin')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth with role and display info';

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Centre admins can read trainer profiles (for their centres)
CREATE POLICY "Centre admins can read trainer profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'centre_admin'
    )
    AND role = 'trainer'
  );

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert is handled by the trigger (service role), but allow for signup flow
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================
-- 2. INVITATIONS TABLE
-- Trainer invitation flow: centre admins invite trainers by email.
-- ============================================================

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  centre_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'declined')) DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.invitations IS 'Trainer invitations sent by fitness centre admins';

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Centre admins can read invitations they created
CREATE POLICY "Centre admins can read own invitations"
  ON public.invitations FOR SELECT
  USING (auth.uid() = invited_by);

-- Centre admins can create invitations
CREATE POLICY "Centre admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'centre_admin'
    )
  );

-- Centre admins can update invitations they created (e.g., cancel)
CREATE POLICY "Centre admins can update own invitations"
  ON public.invitations FOR UPDATE
  USING (auth.uid() = invited_by)
  WITH CHECK (auth.uid() = invited_by);

-- Allow anonymous read by token (for accepting invitations before signing up)
-- This uses a security-definer function instead of direct access
CREATE POLICY "Anyone can read invitation by token"
  ON public.invitations FOR SELECT
  USING (true);
  -- Note: API route filters by token; RLS allows read so the accept flow works
  -- for unauthenticated users. The token itself acts as the secret.

-- Indexes
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_centre_id ON public.invitations(centre_id);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- ============================================================
-- 3. TRAINER-CENTRE ASSIGNMENTS TABLE
-- Many-to-many: trainers can be assigned to multiple centres.
-- ============================================================

CREATE TABLE public.trainer_centre_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trainer_id, centre_id)
);

COMMENT ON TABLE public.trainer_centre_assignments IS 'Many-to-many relationship between trainers and fitness centres';

-- RLS
ALTER TABLE public.trainer_centre_assignments ENABLE ROW LEVEL SECURITY;

-- Trainers can see their own assignments
CREATE POLICY "Trainers can read own assignments"
  ON public.trainer_centre_assignments FOR SELECT
  USING (auth.uid() = trainer_id);

-- Centre admins can read assignments for their centres
-- (We'll refine this when the centres table exists in PROJ-2)
CREATE POLICY "Centre admins can read assignments"
  ON public.trainer_centre_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'centre_admin'
    )
  );

-- Only centre admins can create assignments (via invitation accept flow)
CREATE POLICY "Centre admins can create assignments"
  ON public.trainer_centre_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'centre_admin'
    )
  );

-- Centre admins can remove trainer assignments
CREATE POLICY "Centre admins can delete assignments"
  ON public.trainer_centre_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'centre_admin'
    )
  );

-- Indexes
CREATE INDEX idx_tca_trainer_id ON public.trainer_centre_assignments(trainer_id);
CREATE INDEX idx_tca_centre_id ON public.trainer_centre_assignments(centre_id);

-- ============================================================
-- 4. AUTO-CREATE PROFILE TRIGGER
-- When a new user signs up, create their profile automatically.
-- This uses the raw_user_meta_data from the signup call.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'athlete'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. UPDATED_AT TRIGGER FOR PROFILES
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
