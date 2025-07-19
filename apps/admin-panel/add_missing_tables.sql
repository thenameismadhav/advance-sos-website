-- Add missing tables for SOS Emergency System
-- Run this in your Supabase SQL Editor

-- Create user_locations table for tracking user location history
CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    city TEXT,
    country TEXT,
    address TEXT,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_locations table for tracking emergency location data
CREATE TABLE IF NOT EXISTS public.emergency_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    emergency_id UUID REFERENCES public.sos_events(id) ON DELETE CASCADE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    city TEXT,
    country TEXT,
    address TEXT,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_created_at ON public.user_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_locations_location ON public.user_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX IF NOT EXISTS idx_emergency_locations_user_id ON public.emergency_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_emergency_id ON public.emergency_locations(emergency_id);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_is_active ON public.emergency_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_location ON public.emergency_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Enable Row Level Security for new tables
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_locations
CREATE POLICY "Users can view their own location history" ON public.user_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own location data" ON public.user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location data" ON public.user_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user locations" ON public.user_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Create RLS policies for emergency_locations
CREATE POLICY "Users can view their own emergency locations" ON public.emergency_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency location data" ON public.emergency_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency location data" ON public.emergency_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all emergency locations" ON public.emergency_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_user_locations_updated_at 
    BEFORE UPDATE ON public.user_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_locations_updated_at 
    BEFORE UPDATE ON public.emergency_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the tables were created
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('user_locations', 'emergency_locations')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position; 