# Immediate Fixes for SOS Admin Panel

## 🚨 Current Issues Fixed

### 1. MapboxDraw Event Listener Error
**Error:** `draw.current.on is not a function`

**Fix Applied:** Changed from `draw.current.on()` to `map.current.on('draw.create')` etc.
- MapboxDraw events are fired on the map instance, not the draw instance
- Fixed in `AdvancedMap.tsx` lines 231-233

### 2. Location Tracking Multiple Calls
**Error:** `Location tracking is already active`

**Fix Applied:** Added guards to prevent multiple simultaneous location requests
- Added `if (isLoading) return;` check
- Added `if (watchId === -1)` check before starting new watch
- Fixed in `LocationContext.tsx`

### 3. Zones Table 400 Error
**Error:** `GET /rest/v1/zones?select=*&is_active=eq.true&order=created_at.desc 400`

**Fix Applied:** 
- Created simplified zones table creation script
- Added error handling to zones loading
- Zones will load as empty array if table doesn't exist

## 🚀 Immediate Actions Required

### Step 1: Create Zones Table
Run this in your Supabase SQL Editor:

```sql
-- Copy and paste this entire script
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

CREATE INDEX IF NOT EXISTS idx_zones_is_active ON public.zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_created_at ON public.zones(created_at);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view zones" ON public.zones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert zones" ON public.zones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

GRANT ALL ON public.zones TO authenticated;

INSERT INTO public.zones (name, description, geojson, type, color, created_by) 
VALUES (
  'Test Zone',
  'A test zone for development',
  '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[73.15, 22.30], [73.18, 22.30], [73.18, 22.33], [73.15, 22.33], [73.15, 22.30]]]}, "properties": {}}',
  'polygon',
  '#ff0000',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;
```

### Step 2: Add Foreign Key Constraints (if not done already)
```sql
ALTER TABLE public.sos_events 
ADD CONSTRAINT fk_sos_events_assigned_helper_id 
FOREIGN KEY (assigned_helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;

ALTER TABLE public.sos_events 
ADD CONSTRAINT fk_sos_events_assigned_responder_id 
FOREIGN KEY (assigned_responder_id) REFERENCES public.responders(id) ON DELETE SET NULL;
```

### Step 3: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## ✅ Expected Results After Fixes

1. **No more MapboxDraw errors** in console
2. **No more location tracking conflicts**
3. **Zones API calls should work** (200 status instead of 400)
4. **Map should load completely** without errors
5. **All admin panel features should work** properly

## 🔍 Verification Steps

1. **Check browser console** for any remaining errors
2. **Test zones API** in Network tab: `GET /rest/v1/zones?select=*&is_active=eq.true&order=created_at.desc`
3. **Verify map loads** with all features working
4. **Test location tracking** - should work without conflicts

## 📁 Files Modified

1. `src/components/map/AdvancedMap.tsx` - Fixed MapboxDraw events and added error handling
2. `src/contexts/LocationContext.tsx` - Fixed location tracking conflicts
3. `create_zones_table_simple.sql` - Simplified zones table creation

## 🆘 If Issues Persist

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check Supabase dashboard** for any SQL execution errors
3. **Verify all tables exist** in Supabase: `users`, `helpers`, `responders`, `sos_events`, `zones`
4. **Check RLS policies** are properly configured
5. **Ensure user authentication** is working

## 🎯 Next Steps

After these fixes are applied:
1. Test all admin panel features
2. Verify map drawing tools work
3. Test zone management functionality
4. Ensure all API calls return 200 status codes 