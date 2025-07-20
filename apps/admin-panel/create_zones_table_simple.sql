-- Simple zones table creation script
-- Run this in your Supabase SQL Editor

-- Create zones table if it doesn't exist
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

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_zones_is_active ON public.zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_created_at ON public.zones(created_at);

-- Enable RLS
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for authenticated users
CREATE POLICY "Allow authenticated users to view zones" ON public.zones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert zones" ON public.zones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.zones TO authenticated;

-- Insert a sample zone for testing
INSERT INTO public.zones (name, description, geojson, type, color, created_by) 
VALUES (
  'Test Zone',
  'A test zone for development',
  '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[73.15, 22.30], [73.18, 22.30], [73.18, 22.33], [73.15, 22.33], [73.15, 22.30]]]}, "properties": {}}',
  'polygon',
  '#ff0000',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Zones table created successfully!' as status; 