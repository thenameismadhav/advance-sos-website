# Database and React Fixes for SOS Admin Panel

## 🚨 Issues Identified

### 1. Supabase 400 Errors
The following API calls are failing with 400 errors:
- `responders?select=*,user:users(email,avatar_url)&order=created_at.desc`
- `sos_events?select=*,user:users(name,phone,email),assigned_helper:helpers!assigned_helper_id(id,name,phone),assigned_responder:responders!assigned_responder_id(id,name,phone,organization)&order=created_at.desc`
- `helpers?select=*,user:users(email,avatar_url)&order=created_at.desc`
- `zones?select=*&is_active=eq.true&order=created_at.desc`

### 2. React Infinite Re-render Warning
The `AdvancedMap` component is causing infinite re-renders due to object recreation in useEffect dependencies.

## 🔧 Fixes Applied

### 1. Database Schema Fixes

#### A. Added Missing Foreign Key Constraints
The `sos_events` table was missing foreign key constraints for `assigned_helper_id` and `assigned_responder_id`.

**Fixed in:** `supabase_schema.sql`
```sql
-- Before
assigned_helper_id UUID,
assigned_responder_id UUID,

-- After  
assigned_helper_id UUID REFERENCES public.helpers(id) ON DELETE SET NULL,
assigned_responder_id UUID REFERENCES public.responders(id) ON DELETE SET NULL,
```

#### B. Create Zones Table
The zones table needs to be created in your Supabase database.

**File:** `create_zones_table.sql`
Run this script in your Supabase SQL Editor to create the zones table with proper structure and sample data.

### 2. React Component Fixes

#### A. Fixed Infinite Re-render in AdvancedMap
**File:** `src/components/map/AdvancedMap.tsx`

**Problem:** Configuration objects were being recreated on every render, causing infinite re-renders.

**Solution:** Used `React.useMemo()` to memoize configuration objects.

```typescript
// Before
const clusteringConfig: ClusteringConfig = {
  enabled: showClusters,
  maxZoom: 14,
  radius: 100,
  colors: { ... }
};

// After
const clusteringConfig: ClusteringConfig = React.useMemo(() => ({
  enabled: showClusters,
  maxZoom: 14,
  radius: 100,
  colors: { ... }
}), [showClusters]);
```

## 🚀 How to Apply Fixes

### Step 1: Update Database Schema

1. **Run the foreign key fix script:**
   ```sql
   -- Copy and paste this into your Supabase SQL Editor
   ALTER TABLE public.sos_events 
   ADD CONSTRAINT fk_sos_events_assigned_helper_id 
   FOREIGN KEY (assigned_helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;

   ALTER TABLE public.sos_events 
   ADD CONSTRAINT fk_sos_events_assigned_responder_id 
   FOREIGN KEY (assigned_responder_id) REFERENCES public.responders(id) ON DELETE SET NULL;
   ```

2. **Create the zones table:**
   - Open `create_zones_table.sql`
   - Copy the entire content
   - Paste into your Supabase SQL Editor
   - Execute the script

### Step 2: Verify Database Structure

Run this query to verify all tables and constraints:

```sql
-- Check if zones table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('zones', 'sos_events', 'helpers', 'responders', 'users');

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'sos_events';
```

### Step 3: Test API Calls

After applying the fixes, test these API calls in your browser's Network tab:

1. **Responders:** `GET /rest/v1/responders?select=*,user:users(email,avatar_url)&order=created_at.desc`
2. **SOS Events:** `GET /rest/v1/sos_events?select=*,user:users(name,phone,email),assigned_helper:helpers!assigned_helper_id(id,name,phone),assigned_responder:responders!assigned_responder_id(id,name,phone,organization)&order=created_at.desc`
3. **Helpers:** `GET /rest/v1/helpers?select=*,user:users(email,avatar_url)&order=created_at.desc`
4. **Zones:** `GET /rest/v1/zones?select=*&is_active=eq.true&order=created_at.desc`

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## ✅ Expected Results

After applying these fixes:

1. **No more 400 errors** in the browser console
2. **No more infinite re-render warnings** from React
3. **All API calls should return 200 status** with proper data
4. **Map should load without performance issues**

## 🐛 Troubleshooting

### If you still get 400 errors:

1. **Check RLS Policies:** Ensure your Supabase Row Level Security policies allow the queries
2. **Verify User Authentication:** Make sure you're authenticated when making API calls
3. **Check Table Permissions:** Verify that the tables have proper permissions for authenticated users

### If you still get infinite re-renders:

1. **Clear browser cache** and restart the dev server
2. **Check for other useEffect dependencies** that might be causing issues
3. **Use React DevTools** to profile the component and identify the source

## 📞 Support

If you continue to experience issues after applying these fixes, please:

1. Check the browser console for any new error messages
2. Verify that all SQL scripts executed successfully
3. Test the API calls directly in the Supabase dashboard
4. Check the Network tab in browser DevTools for specific error details 