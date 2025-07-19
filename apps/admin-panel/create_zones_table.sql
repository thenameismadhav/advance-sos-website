-- Create zones table for storing drawn zones and geospatial data
-- Run this in your Supabase SQL Editor

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_zones_created_by ON zones(created_by);
CREATE INDEX IF NOT EXISTS idx_zones_type ON zones(type);
CREATE INDEX IF NOT EXISTS idx_zones_is_active ON zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_geojson ON zones USING GIN(geojson);

-- Enable Row Level Security
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view zones" ON zones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert zones" ON zones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update zones" ON zones
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete zones" ON zones
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample zones for testing
INSERT INTO zones (name, description, geojson, type, color, created_by) VALUES
(
  'Downtown Emergency Zone',
  'High-priority emergency response zone covering downtown area',
  '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[73.15, 22.30], [73.18, 22.30], [73.18, 22.33], [73.15, 22.33], [73.15, 22.30]]]}, "properties": {}}',
  'polygon',
  '#ff0000',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Hospital Coverage Area',
  '5km radius around main hospital',
  '{"type": "Feature", "geometry": {"type": "Point", "coordinates": [73.1812, 22.3072]}, "properties": {"radius": 5000}}',
  'circle',
  '#00ff00',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON zones TO anon, authenticated;

-- Success message
SELECT 'Zones table created successfully with sample data!' as status; 