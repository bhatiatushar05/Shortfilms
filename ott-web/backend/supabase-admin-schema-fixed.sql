-- Corrected Database Schema for Admin Portal
-- This matches your existing database structure where titles.id is TEXT, not UUID

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('user', 'admin', 'moderator')) DEFAULT 'user',
    status TEXT CHECK (status IN ('active', 'suspended', 'banned')) DEFAULT 'active',
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Create media table for file management (fixed to match existing structure)
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY,
    title_id TEXT REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
    episode_id TEXT REFERENCES public.episodes(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('video', 'image', 'audio', 'subtitle')) NOT NULL,
    image_type TEXT CHECK (image_type IN ('poster', 'hero', 'thumbnail')),
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    duration REAL, -- for videos, in seconds
    resolution TEXT, -- for videos, e.g., "1920x1080"
    dimensions JSONB, -- for images, e.g., {"width": 1920, "height": 1080}
    thumbnail_path TEXT,
    status TEXT CHECK (status IN ('uploading', 'processing', 'processed', 'failed')) DEFAULT 'uploading',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table for user billing
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create content_approvals table for content moderation
CREATE TABLE IF NOT EXISTS public.content_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_id TEXT REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes')) DEFAULT 'pending',
    submission_notes TEXT,
    review_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    scheduled_publish_date TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_title_id ON public.media(title_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media(status);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON public.media(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON public.admin_actions(action);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_approvals_title_id ON public.content_approvals(title_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON public.content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_submitted_at ON public.content_approvals(submitted_at DESC);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Media policies
CREATE POLICY "Public can view processed media" ON public.media
    FOR SELECT USING (status = 'processed');

CREATE POLICY "Admins can manage all media" ON public.media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin actions policies
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert admin actions" ON public.admin_actions
    FOR INSERT WITH CHECK (true);

-- Content approvals policies
CREATE POLICY "Content creators can view their submissions" ON public.content_approvals
    FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all content approvals" ON public.content_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create functions for common admin operations
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.admin_actions (admin_id, action, resource_type, resource_id, details)
    VALUES (p_admin_id, p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_period_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_users BIGINT,
    new_users BIGINT,
    active_users BIGINT,
    premium_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.profiles) as total_users,
        (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '1 day' * p_period_days) as new_users,
        (SELECT COUNT(DISTINCT user_id) FROM public.progress WHERE updated_at >= NOW() - INTERVAL '1 day' * p_period_days) as active_users,
        (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active') as premium_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get content statistics
CREATE OR REPLACE FUNCTION public.get_content_stats(p_period_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_titles BIGINT,
    total_movies BIGINT,
    total_series BIGINT,
    total_episodes BIGINT,
    new_content BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.titles) as total_titles,
        (SELECT COUNT(*) FROM public.titles WHERE kind = 'movie') as total_movies,
        (SELECT COUNT(*) FROM public.titles WHERE kind = 'series') as total_series,
        (SELECT COUNT(*) FROM public.episodes) as total_episodes,
        (SELECT COUNT(*) FROM public.titles WHERE created_at >= NOW() - INTERVAL '1 day' * p_period_days) as new_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.media TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.admin_actions TO authenticated;
GRANT ALL ON public.content_approvals TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_content_stats(INTEGER) TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
