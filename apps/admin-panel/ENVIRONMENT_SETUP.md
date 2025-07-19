# Environment Setup Guide

## 1. Create Environment File

Create a `.env` file in your project root with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://odkvcbnsimkhpmkllngo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TEqMgL9G9YLUxfcRpXvvtQ_WuhU82Hn

# Mapbox Configuration
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw

# App Configuration
VITE_APP_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_2FA=false
VITE_ENABLE_AUDIT_LOGS=true
VITE_ENABLE_MULTILANGUAGE=true
```

## 2. Install Dependencies

```bash
npm install @supabase/supabase-js mapbox-gl
npm install @types/mapbox-gl --save-dev
```

## 3. Run Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Execute the script

## 4. Create Admin User

After running the schema, create your admin user:

```sql
-- First, create the auth user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'advancesossystem@gmail.com',
    crypt('admin2026', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- Then update the admin record with the actual user ID
UPDATE public.admins 
SET id = (SELECT id FROM auth.users WHERE email = 'advancesossystem@gmail.com')
WHERE email = 'advancesossystem@gmail.com';
```

## 5. Start Development Server

```bash
npm run dev
```

## 6. Access Admin Panel

Navigate to: `http://localhost:3000/admin/login`

Login credentials:
- Email: `advancesossystem@gmail.com`
- Password: `admin2026`

## Troubleshooting

### Environment Variables Not Working
Make sure your `.env` file is in the project root and uses the `VITE_` prefix.

### Supabase Connection Issues
1. Check your Supabase URL and anon key
2. Ensure RLS policies are properly set up
3. Verify the database schema has been executed

### Mapbox Not Loading
1. Check your Mapbox token
2. Ensure the token has the correct permissions
3. Check browser console for any CORS issues 