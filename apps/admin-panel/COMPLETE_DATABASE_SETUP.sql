-- Complete Database Setup for SOS Admin Panel
-- Run this script in your Supabase SQL Editor to fix all 400 errors

-- Step 1: Ensure all tables exist with proper structure
-- Users table (should already exist)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpers table
CREATE TABLE IF NOT EXISTS public.helpers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status helper_status DEFAULT 'offline',
    emergency_types emergency_type[] DEFAULT '{}',
    max_distance DOUBLE PRECISION DEFAULT 10.0,
    rating DOUBLE PRECISION DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_helps INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Responders table
CREATE TABLE IF NOT EXISTS public.responders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL,
    department TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status helper_status DEFAULT 'offline',
    emergency_types emergency_type[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOS Events table with proper foreign keys
CREATE TABLE IF NOT EXISTS public.sos_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    emergency_type emergency_type NOT NULL,
    status sos_status DEFAULT 'active',
    description TEXT,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    assigned_helper_id UUID REFERENCES public.helpers(id) ON DELETE SET NULL,
    assigned_responder_id UUID REFERENCES public.responders(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    geojson JSONB NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('polygon', 'circle', 'rectangle')),
    color TEXT DEFAULT '#ff0000',
    opacity REAL DEFAULT 0.3,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add missing foreign key constraints (if they don't exist)
DO $$ 
BEGIN
    -- Add foreign key for assigned_helper_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_sos_events_assigned_helper_id'
    ) THEN
        ALTER TABLE public.sos_events 
        ADD CONSTRAINT fk_sos_events_assigned_helper_id 
        FOREIGN KEY (assigned_helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key for assigned_responder_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_sos_events_assigned_responder_id'
    ) THEN
        ALTER TABLE public.sos_events 
        ADD CONSTRAINT fk_sos_events_assigned_responder_id 
        FOREIGN KEY (assigned_responder_id) REFERENCES public.responders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_helpers_user_id ON public.helpers(user_id);
CREATE INDEX IF NOT EXISTS idx_helpers_status ON public.helpers(status);
CREATE INDEX IF NOT EXISTS idx_helpers_location ON public.helpers USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX IF NOT EXISTS idx_responders_user_id ON public.responders(user_id);
CREATE INDEX IF NOT EXISTS idx_responders_status ON public.responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_location ON public.responders USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX IF NOT EXISTS idx_sos_events_user_id ON public.sos_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_events_status ON public.sos_events(status);
CREATE INDEX IF NOT EXISTS idx_sos_events_created_at ON public.sos_events(created_at);

CREATE INDEX IF NOT EXISTS idx_zones_is_active ON public.zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_created_at ON public.zones(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for authenticated users
-- Users policies
CREATE POLICY "Allow authenticated users to view users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Helpers policies
CREATE POLICY "Allow authenticated users to view helpers" ON public.helpers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert helpers" ON public.helpers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow helpers to update their own data" ON public.helpers
    FOR UPDATE USING (auth.uid() = user_id);

-- Responders policies
CREATE POLICY "Allow authenticated users to view responders" ON public.responders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert responders" ON public.responders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow responders to update their own data" ON public.responders
    FOR UPDATE USING (auth.uid() = user_id);

-- SOS Events policies
CREATE POLICY "Allow authenticated users to view sos_events" ON public.sos_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert sos_events" ON public.sos_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own sos events" ON public.sos_events
    FOR UPDATE USING (auth.uid() = user_id);

-- Zones policies
CREATE POLICY "Allow authenticated users to view zones" ON public.zones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert zones" ON public.zones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.helpers TO authenticated;
GRANT ALL ON public.responders TO authenticated;
GRANT ALL ON public.sos_events TO authenticated;
GRANT ALL ON public.zones TO authenticated;

-- Step 7: Insert sample data for testing (if tables are empty)
INSERT INTO public.users (id, email, name, role, is_verified)
SELECT 
    auth.uid(),
    'admin@example.com',
    'Admin User',
    'admin',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@example.com')
AND auth.uid() IS NOT NULL;

-- Insert sample helper
INSERT INTO public.helpers (user_id, name, phone, latitude, longitude, status, emergency_types, is_verified)
SELECT 
    (SELECT id FROM public.users WHERE email = 'admin@example.com' LIMIT 1),
    'Test Helper',
    '+1234567890',
    22.3072,
    73.1812,
    'available',
    ARRAY['medical', 'fire'],
    true
WHERE NOT EXISTS (SELECT 1 FROM public.helpers WHERE name = 'Test Helper');

-- Insert sample responder
INSERT INTO public.responders (user_id, name, phone, organization, department, latitude, longitude, status, emergency_types, is_verified)
SELECT 
    (SELECT id FROM public.users WHERE email = 'admin@example.com' LIMIT 1),
    'Test Responder',
    '+1234567890',
    'Emergency Services',
    'Medical',
    22.3072,
    73.1812,
    'available',
    ARRAY['medical'],
    true
WHERE NOT EXISTS (SELECT 1 FROM public.responders WHERE name = 'Test Responder');

-- Insert sample SOS event
INSERT INTO public.sos_events (user_id, latitude, longitude, emergency_type, description, priority)
SELECT 
    (SELECT id FROM public.users WHERE email = 'admin@example.com' LIMIT 1),
    22.3072,
    73.1812,
    'medical',
    'Test emergency situation',
    3
WHERE NOT EXISTS (SELECT 1 FROM public.sos_events WHERE description = 'Test emergency situation');

-- Insert sample zone
INSERT INTO public.zones (name, description, geojson, type, color, created_by)
SELECT 
    'Test Zone',
    'A test zone for development',
    '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[73.15, 22.30], [73.18, 22.30], [73.18, 22.33], [73.15, 22.33], [73.15, 22.30]]]}, "properties": {}}',
    'polygon',
    '#ff0000',
    (SELECT id FROM public.users WHERE email = 'admin@example.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE name = 'Test Zone');

-- Step 8: Success message
SELECT 'Database setup completed successfully! All tables and relationships are now properly configured.' as status; 