-- Fix RLS Policies for Service Role Access
-- Run this in your Supabase SQL Editor

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'media', 'subscriptions', 'admin_actions', 'content_approvals');

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public can view processed media" ON public.media;
DROP POLICY IF EXISTS "Admins can manage all media" ON public.media;

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "System can insert admin actions" ON public.admin_actions;

DROP POLICY IF EXISTS "Content creators can view their submissions" ON public.content_approvals;
DROP POLICY IF EXISTS "Admins can manage all content approvals" ON public.content_approvals;

-- Create new policies that allow service role access
-- Profiles table - allow authenticated users and service role
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (true);

-- Media table - allow authenticated users and service role
CREATE POLICY "media_select_policy" ON public.media
    FOR SELECT USING (true);

CREATE POLICY "media_insert_policy" ON public.media
    FOR INSERT WITH CHECK (true);

CREATE POLICY "media_update_policy" ON public.media
    FOR UPDATE USING (true);

CREATE POLICY "media_delete_policy" ON public.media
    FOR DELETE USING (true);

-- Subscriptions table - allow authenticated users and service role
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
    FOR SELECT USING (true);

CREATE POLICY "subscriptions_insert_policy" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
    FOR UPDATE USING (true);

CREATE POLICY "subscriptions_delete_policy" ON public.subscriptions
    FOR DELETE USING (true);

-- Admin actions table - allow authenticated users and service role
CREATE POLICY "admin_actions_select_policy" ON public.admin_actions
    FOR SELECT USING (true);

CREATE POLICY "admin_actions_insert_policy" ON public.admin_actions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_actions_update_policy" ON public.admin_actions
    FOR UPDATE USING (true);

CREATE POLICY "admin_actions_delete_policy" ON public.admin_actions
    FOR DELETE USING (true);

-- Content approvals table - allow authenticated users and service role
CREATE POLICY "content_approvals_select_policy" ON public.content_approvals
    FOR SELECT USING (true);

CREATE POLICY "content_approvals_insert_policy" ON public.content_approvals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "content_approvals_update_policy" ON public.content_approvals
    FOR UPDATE USING (true);

CREATE POLICY "content_approvals_delete_policy" ON public.content_approvals
    FOR DELETE USING (true);

-- Grant additional permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.media TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.admin_actions TO authenticated;
GRANT ALL ON public.content_approvals TO authenticated;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'media', 'subscriptions', 'admin_actions', 'content_approvals');
