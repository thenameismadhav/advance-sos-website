-- Emergency SOS System Database Schema
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types
CREATE TYPE emergency_type AS ENUM ('medical', 'fire', 'police', 'accident', 'other');
CREATE TYPE sos_status AS ENUM ('active', 'assigned', 'resolved', 'cancelled');
CREATE TYPE helper_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE user_role AS ENUM ('user', 'helper', 'responder', 'admin');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
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

-- Create admins table (extends auth.users)
CREATE TABLE public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    organization TEXT,
    phone TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SOS events table
CREATE TABLE public.sos_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    emergency_type emergency_type NOT NULL,
    status sos_status DEFAULT 'active',
    description TEXT,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    assigned_helper_id UUID,
    assigned_responder_id UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helpers table
CREATE TABLE public.helpers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status helper_status DEFAULT 'offline',
    emergency_types emergency_type[] DEFAULT '{}',
    max_distance DOUBLE PRECISION DEFAULT 10.0, -- in kilometers
    rating DOUBLE PRECISION DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_helps INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responders table
CREATE TABLE public.responders (
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

-- Create hospitals table
CREATE TABLE public.hospitals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    emergency_services TEXT[] DEFAULT '{}',
    is_24_hours BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE public.media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sos_event_id UUID REFERENCES public.sos_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type media_type NOT NULL,
    file_size BIGINT NOT NULL,
    duration INTEGER, -- in seconds, for video/audio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin logs table
CREATE TABLE public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_blocked ON public.users(is_blocked);

CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_admins_role ON public.admins(role);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);

CREATE INDEX idx_sos_events_user_id ON public.sos_events(user_id);
CREATE INDEX idx_sos_events_status ON public.sos_events(status);
CREATE INDEX idx_sos_events_emergency_type ON public.sos_events(emergency_type);
CREATE INDEX idx_sos_events_created_at ON public.sos_events(created_at);
CREATE INDEX idx_sos_events_location ON public.sos_events USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX idx_helpers_user_id ON public.helpers(user_id);
CREATE INDEX idx_helpers_status ON public.helpers(status);
CREATE INDEX idx_helpers_location ON public.helpers USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX idx_helpers_emergency_types ON public.helpers USING GIN (emergency_types);

CREATE INDEX idx_responders_user_id ON public.responders(user_id);
CREATE INDEX idx_responders_status ON public.responders(status);
CREATE INDEX idx_responders_location ON public.responders USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX idx_responders_emergency_types ON public.responders USING GIN (emergency_types);

CREATE INDEX idx_hospitals_location ON public.hospitals USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX idx_media_sos_event_id ON public.media(sos_event_id);
CREATE INDEX idx_media_user_id ON public.media(user_id);
CREATE INDEX idx_media_file_type ON public.media(file_type);
CREATE INDEX idx_media_created_at ON public.media(created_at);

CREATE INDEX idx_locations_user_id ON public.locations(user_id);
CREATE INDEX idx_locations_location ON public.locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sos_events_updated_at BEFORE UPDATE ON public.sos_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_helpers_updated_at BEFORE UPDATE ON public.helpers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_responders_updated_at BEFORE UPDATE ON public.responders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Create function to find nearby helpers
CREATE OR REPLACE FUNCTION find_nearby_helpers(
    sos_lat DOUBLE PRECISION,
    sos_lon DOUBLE PRECISION,
    max_distance DOUBLE PRECISION DEFAULT 10.0,
    emergency_type_param emergency_type DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status helper_status,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.phone,
        h.latitude,
        h.longitude,
        h.status,
        calculate_distance(sos_lat, sos_lon, h.latitude, h.longitude) as distance
    FROM public.helpers h
    WHERE h.status = 'available'
    AND calculate_distance(sos_lat, sos_lon, h.latitude, h.longitude) <= max_distance
    AND (emergency_type_param IS NULL OR emergency_type_param = ANY(h.emergency_types))
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to find nearby responders
CREATE OR REPLACE FUNCTION find_nearby_responders(
    sos_lat DOUBLE PRECISION,
    sos_lon DOUBLE PRECISION,
    max_distance DOUBLE PRECISION DEFAULT 20.0,
    emergency_type_param emergency_type DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    organization TEXT,
    department TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status helper_status,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.phone,
        r.organization,
        r.department,
        r.latitude,
        r.longitude,
        r.status,
        calculate_distance(sos_lat, sos_lon, r.latitude, r.longitude) as distance
    FROM public.responders r
    WHERE r.status = 'available'
    AND calculate_distance(sos_lat, sos_lon, r.latitude, r.longitude) <= max_distance
    AND (emergency_type_param IS NULL OR emergency_type_param = ANY(r.emergency_types))
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to find nearby hospitals
CREATE OR REPLACE FUNCTION find_nearby_hospitals(
    sos_lat DOUBLE PRECISION,
    sos_lon DOUBLE PRECISION,
    max_distance DOUBLE PRECISION DEFAULT 50.0
) RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    emergency_services TEXT[],
    is_24_hours BOOLEAN,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.phone,
        h.address,
        h.latitude,
        h.longitude,
        h.emergency_services,
        h.is_24_hours,
        calculate_distance(sos_lat, sos_lon, h.latitude, h.longitude) as distance
    FROM public.hospitals h
    WHERE calculate_distance(sos_lat, sos_lon, h.latitude, h.longitude) <= max_distance
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Admins policies
CREATE POLICY "Admins can view their own profile" ON public.admins
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can view all admins" ON public.admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

CREATE POLICY "Super admins can manage all admins" ON public.admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- SOS Events policies
CREATE POLICY "Users can view their own SOS events" ON public.sos_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create SOS events" ON public.sos_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS events" ON public.sos_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all SOS events" ON public.sos_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all SOS events" ON public.sos_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Helpers policies
CREATE POLICY "Helpers can view their own profile" ON public.helpers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Helpers can update their own profile" ON public.helpers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all helpers" ON public.helpers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all helpers" ON public.helpers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Responders policies
CREATE POLICY "Responders can view their own profile" ON public.responders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Responders can update their own profile" ON public.responders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all responders" ON public.responders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all responders" ON public.responders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Hospitals policies (public read, admin write)
CREATE POLICY "Anyone can view hospitals" ON public.hospitals
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage hospitals" ON public.hospitals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Media policies
CREATE POLICY "Users can view media from their SOS events" ON public.media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sos_events 
            WHERE id = sos_event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload media to their SOS events" ON public.media
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sos_events 
            WHERE id = sos_event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all media" ON public.media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all media" ON public.media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Locations policies
CREATE POLICY "Users can view their own locations" ON public.locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own locations" ON public.locations
    FOR ALL USING (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Users can view their own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emergency contacts" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- Admin logs policies
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "System can insert admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (true);

-- Insert default admin user
INSERT INTO public.admins (id, email, name, role, permissions, is_active) VALUES (
    '00000000-0000-0000-0000-000000000000', -- This will be replaced with actual user ID
    'advancesossystem@gmail.com',
    'System Admin',
    'super_admin',
    '{"canManageAdmins": true, "canViewAuditLogs": true, "canViewAnalytics": true, "canExportData": true}',
    true
);

-- Insert sample hospitals
INSERT INTO public.hospitals (name, phone, address, latitude, longitude, emergency_services, is_24_hours) VALUES
('Vadodara General Hospital', '+91-265-1234567', 'Race Course Road, Vadodara, Gujarat', 22.3072, 73.1812, ARRAY['Emergency', 'Trauma', 'Cardiology'], true),
('Sayaji Hospital', '+91-265-2345678', 'Fatehgunj, Vadodara, Gujarat', 22.3100, 73.1800, ARRAY['Emergency', 'Pediatrics', 'Orthopedics'], true),
('SSG Hospital', '+91-265-3456789', 'Gotri Road, Vadodara, Gujarat', 22.3050, 73.1850, ARRAY['Emergency', 'Neurology', 'Oncology'], true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('media-images', 'media-images', true),
('media-videos', 'media-videos', true),
('media-audio', 'media-audio', true);

-- Storage policies
CREATE POLICY "Public read access for media" ON storage.objects
    FOR SELECT USING (bucket_id IN ('media-images', 'media-videos', 'media-audio'));

CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('media-images', 'media-videos', 'media-audio') 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own media" ON storage.objects
    FOR UPDATE USING (
        bucket_id IN ('media-images', 'media-videos', 'media-audio') 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can delete any media" ON storage.objects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND is_active = true
        )
    ); 