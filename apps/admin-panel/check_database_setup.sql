-- Database Setup Check for Temporary Admin Access
-- Run this in your Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'admins') THEN '✅ Required'
        ELSE '⚠️ Optional'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'admins', 'sos_events', 'helpers', 'responders', 'hospitals', 'media', 'locations', 'emergency_contacts', 'admin_logs', 'user_locations', 'emergency_locations')
ORDER BY table_name;

-- 2. Check users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check admins table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS policies for users table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 5. Check RLS policies for admins table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admins' 
AND schemaname = 'public';

-- 6. Check if there are any users in the users table
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_users
FROM public.users;

-- 7. Check if there are any admins in the admins table
SELECT 
    COUNT(*) as total_admins,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_admins,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
    COUNT(CASE WHEN organization = 'Temporary Access' THEN 1 END) as temporary_admins
FROM public.admins;

-- 8. Check auth.users table (if accessible)
-- Note: This might not work due to RLS, but worth trying
SELECT 
    COUNT(*) as total_auth_users
FROM auth.users;

-- 9. Test creating a sample user profile (this will fail if RLS blocks it)
-- Uncomment the lines below to test user creation
/*
INSERT INTO public.users (id, email, name, phone, role, is_verified, is_blocked)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    'Test User',
    '+1234567890',
    'user',
    true,
    false
) ON CONFLICT (id) DO NOTHING;
*/

-- 10. Check for any recent errors in the logs (if available)
-- This is a placeholder - actual log access depends on your Supabase plan
SELECT 'Log access depends on Supabase plan' as note;

-- Summary
SELECT 
    'Database Setup Check Complete' as status,
    'Check the results above to verify your database is properly configured' as message; 