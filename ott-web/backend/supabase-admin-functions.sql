-- Supabase Admin Functions for OTT Platform Integration
-- Run this in your Supabase SQL Editor to enable admin backend access

-- Function to get all OTT platform users (for admin backend)
CREATE OR REPLACE FUNCTION get_ott_users_for_admin()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    phone_confirmed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    confirmation_sent_at TIMESTAMPTZ,
    recovery_sent_at TIMESTAMPTZ,
    email_change_sent_at TIMESTAMPTZ,
    phone_change_sent_at TIMESTAMPTZ,
    reauthentication_sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- This function allows the admin backend to read auth.users table
    -- SECURITY DEFINER means it runs with the privileges of the function creator
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.last_sign_in_at,
        au.email_confirmed_at,
        au.phone_confirmed_at,
        au.confirmed_at,
        au.invited_at,
        au.confirmation_sent_at,
        au.recovery_sent_at,
        au.email_change_sent_at,
        au.phone_change_sent_at,
        au.reauthentication_sent_at,
        au.updated_at
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$;

-- Function to get OTT user details with watchlist and progress
CREATE OR REPLACE FUNCTION get_ott_user_details_for_admin(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    watchlist_count BIGINT,
    progress_count BIGINT,
    total_watch_time INTEGER,
    last_activity TIMESTAMPTZ
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.last_sign_in_at,
        COALESCE(wl.count, 0) as watchlist_count,
        COALESCE(pr.count, 0) as progress_count,
        COALESCE(pr.total_time, 0) as total_watch_time,
        GREATEST(au.last_sign_in_at, pr.last_update) as last_activity
    FROM auth.users au
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as count
        FROM public.watchlist
        GROUP BY user_id
    ) wl ON au.id = wl.user_id
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as count,
            SUM(position_sec) as total_time,
            MAX(updated_at) as last_update
        FROM public.progress
        GROUP BY user_id
    ) pr ON au.id = pr.user_id
    WHERE au.id = user_uuid;
END;
$$;

-- Function to sync OTT users to admin profiles table
CREATE OR REPLACE FUNCTION sync_ott_users_to_admin()
RETURNS INTEGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_count INTEGER := 0;
    ott_user RECORD;
BEGIN
    -- Loop through all OTT platform users
    FOR ott_user IN 
        SELECT id, email, created_at, last_sign_in_at
        FROM auth.users
    LOOP
        -- Insert or update user in admin profiles table
        INSERT INTO public.profiles (id, email, role, status, created_at, last_sign_in_at)
        VALUES (
            ott_user.id,
            ott_user.email,
            'user', -- Default role
            'active', -- Default status
            ott_user.created_at,
            ott_user.last_sign_in_at
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            email = EXCLUDED.email,
            last_sign_in_at = EXCLUDED.last_sign_in_at,
            updated_at = NOW();
        
        user_count := user_count + 1;
    END LOOP;
    
    RETURN user_count;
END;
$$;

-- Grant execute permissions to authenticated users (your admin backend)
GRANT EXECUTE ON FUNCTION get_ott_users_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_ott_user_details_for_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_ott_users_to_admin() TO authenticated;

-- Create a view for easier access to OTT user data
CREATE OR REPLACE VIEW ott_users_admin_view AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(p.role, 'user') as role,
    COALESCE(p.status, 'active') as status,
    p.first_name,
    p.last_name,
    COALESCE(wl.count, 0) as watchlist_count,
    COALESCE(pr.count, 0) as progress_count,
    COALESCE(pr.total_time, 0) as total_watch_time_seconds,
    GREATEST(au.last_sign_in_at, pr.last_update) as last_activity,
    CASE 
        WHEN GREATEST(au.last_sign_in_at, pr.last_update) > NOW() - INTERVAL '5 minutes' 
        THEN true 
        ELSE false 
    END as is_online
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as count
    FROM public.watchlist
    GROUP BY user_id
) wl ON au.id = wl.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as count,
        SUM(position_sec) as total_time,
        MAX(updated_at) as last_update
    FROM public.progress
    GROUP BY user_id
) pr ON au.id = pr.user_id;

-- Grant select on the view
GRANT SELECT ON ott_users_admin_view TO authenticated;
