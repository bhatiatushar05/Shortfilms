-- OTT Platform User Control Tables
-- Run this in your Supabase SQL Editor to enable admin control of OTT users

-- Table to control user access to OTT platform
CREATE TABLE IF NOT EXISTS public.user_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'restricted', 'banned')),
    can_access BOOLEAN NOT NULL DEFAULT true,
    access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'readonly')),
    suspended_at TIMESTAMPTZ,
    suspension_reason TEXT,
    restricted_at TIMESTAMPTZ,
    restriction_reason TEXT,
    banned_at TIMESTAMPTZ,
    ban_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to manage user subscriptions in OTT platform
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium', 'pro')),
    plan_details JSONB DEFAULT '{}',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_controls_user_id ON public.user_controls(user_id);
CREATE INDEX IF NOT EXISTS idx_user_controls_status ON public.user_controls(status);
CREATE INDEX IF NOT EXISTS idx_user_controls_email ON public.user_controls(email);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_type ON public.user_subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON public.user_subscriptions(email);

-- Enable Row Level Security
ALTER TABLE public.user_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_controls
CREATE POLICY "Users can view their own control status" ON public.user_controls
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user controls" ON public.user_controls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to check if user can access OTT platform
CREATE OR REPLACE FUNCTION public.can_user_access_ott(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_status TEXT;
    can_access BOOLEAN;
BEGIN
    -- Get user control status
    SELECT status, can_access INTO user_status, can_access
    FROM public.user_controls
    WHERE user_id = user_uuid;
    
    -- If no control record exists, user has full access
    IF user_status IS NULL THEN
        RETURN true;
    END IF;
    
    -- Check if user is suspended or banned
    IF user_status IN ('suspended', 'banned') THEN
        RETURN false;
    END IF;
    
    -- Return the can_access flag
    RETURN can_access;
END;
$$;

-- Function to get user's effective subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_type TEXT;
BEGIN
    -- Get user subscription
    SELECT subscription_type INTO subscription_type
    FROM public.user_subscriptions
    WHERE user_id = user_uuid;
    
    -- If no subscription record exists, return 'free'
    IF subscription_type IS NULL THEN
        RETURN 'free';
    END IF;
    
    RETURN subscription_type;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.user_controls TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_access_ott(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(UUID) TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO public.user_controls (user_id, email, status, can_access) 
-- VALUES ('your-user-id-here', 'user@example.com', 'active', true);

-- INSERT INTO public.user_subscriptions (user_id, email, subscription_type) 
-- VALUES ('your-user-id-here', 'user@example.com', 'premium');
