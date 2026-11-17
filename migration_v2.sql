-- Migration v2: invitations, profiles, background_image
-- Run this in Supabase SQL Editor

-- 1. Add background_image column to requests
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS background_image text;

-- 2. Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  jabatan varchar,
  email varchar,
  wa_number varchar,
  sent_email_at timestamptz,
  sent_wa_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_request ON public.invitations(request_id);
CREATE INDEX IF NOT EXISTS idx_invitations_created ON public.invitations(request_id, created_at DESC);

-- Index to speed up response lookup per request (used by response list and show pages)
CREATE INDEX IF NOT EXISTS idx_responses_request ON public.responses(request_id);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_owner_all" ON public.invitations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = invitations.request_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = invitations.request_id AND r.user_id = auth.uid()
  ));

-- 3. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name varchar,
  email varchar,
  avatar_url text,
  role varchar DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (signup trigger)
CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile but CANNOT change role (prevents self-escalation)
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "profiles_admin_read_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update any profile (role, name, avatar); explicit WITH CHECK
-- ensures the actor remains an admin after the update (prevents mid-update lockout).
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can delete profiles (cascades to auth.users via FK is NOT automatic;
-- actual auth user deletion requires service_role from backend).
CREATE POLICY "profiles_admin_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill profiles for existing users (run once)
INSERT INTO public.profiles (id, full_name, email)
SELECT id, email, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 6. Add editable text fields to requests
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS custom_message text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS reply_prefix varchar DEFAULT 'Kindly Reply Before';
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS rsvp_title varchar DEFAULT 'RSVP';
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS question_label varchar DEFAULT 'Are you going?';

-- NOTE: Create storage buckets in Supabase Dashboard > Storage:
--   - "backgrounds" (public bucket)
--   - "avatars" (public bucket)
-- Then add storage policies to allow authenticated users to upload.
