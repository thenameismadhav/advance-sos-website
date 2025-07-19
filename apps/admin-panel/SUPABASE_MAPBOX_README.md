# Supabase + Mapbox Integration for Advance SOS

This document explains the integration of Supabase backend and Mapbox maps into the existing React/TypeScript project.

## 🎯 What Was Implemented

### ✅ **Supabase Integration**
- **Database Client**: Configured Supabase client with your credentials
- **Location Service**: Full CRUD operations for location management
- **Real-time Updates**: Live synchronization with Supabase database
- **Error Handling**: Proper error handling and user feedback

### ✅ **Mapbox Integration**
- **Interactive Map**: Full Mapbox GL integration with react-map-gl
- **Click to Add**: Tap anywhere to add locations to database
- **Location Markers**: Display all locations as interactive markers
- **Real-time Sync**: Changes appear immediately across all devices

### ✅ **Admin Panel Enhancement**
- **Dual Map View**: Toggle between SOS Map and Location Manager
- **Location Management**: Add, view, and manage locations
- **Sample Data**: Quick add sample locations for testing
- **Clean UI**: Integrated with existing design system

## 📁 Files Created/Modified

### New Files
```
src/
├── lib/
│   └── supabase.ts              # Supabase client & location service
└── components/admin/
    └── LocationMap.tsx          # Mapbox integration component
```

### Modified Files
```
src/
├── pages/
│   └── Admin.tsx                # Added LocationMap toggle
└── package.json                 # Added mapbox-gl & react-map-gl
```

## 🗄️ Database Schema

The `supabase_schema.sql` creates a complete database schema with all necessary tables:

```sql
-- Complete database schema including:
-- - users (extends Supabase auth)
-- - sos_events (emergency events)
-- - helpers (available helpers)
-- - responders (emergency responders)
-- - hospitals (medical facilities)
-- - media (event attachments)
-- - locations (general location tracking)
-- - Custom types, RLS policies, indexes, and triggers
```

## 🚀 Setup Instructions

### 1. Database Setup
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `odkvcbnsimkhpmkllngo`
3. Go to SQL Editor
4. Run the SQL script from `supabase_schema.sql`

### 2. Dependencies (Already Installed)
```bash
npm install mapbox-gl react-map-gl
```

### 3. Environment Configuration
The app is pre-configured with your credentials:
- **Supabase URL**: `https://odkvcbnsimkhpmkllngo.supabase.co`
- **Supabase Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka3ZjYm5zaW1raHBta2xsbmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTI2MzIsImV4cCI6MjA2NzgyODYzMn0.xHYXF_zuh_YpASkEfd55AtV_hjoEnh0j8RRiNaVL29k`
- **Mapbox Token**: `pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw`

## 🎮 How to Use

### Accessing the Location Manager
1. Navigate to `/admin` in your app
2. In the "Geo-Spatial View" panel, click "Location Manager"
3. You'll see the interactive Mapbox map

### Adding Locations
1. **Click on Map**: Tap anywhere to add a "Clicked Location"
2. **Sample Button**: Use the "Add Sample" button for test data
3. **Real-time**: Changes sync immediately across all devices

### Viewing Locations
- **Map Markers**: All locations appear as red markers
- **Location Cards**: Scrollable list at the bottom
- **Tooltips**: Hover over markers for details

## 🔧 Technical Details

### Supabase Service (`src/lib/supabase.ts`)
```typescript
// Fetch all locations
locationService.fetchLocations()

// Add new location
locationService.insertLocation(name, latitude, longitude)

// Real-time subscription
locationService.subscribeToLocations(callback)
```

### Mapbox Component (`src/components/admin/LocationMap.tsx`)
- **Interactive Map**: Full-screen Mapbox integration
- **Click Handlers**: Map click to add locations
- **Markers**: Custom styled location markers
- **Real-time Updates**: Live sync with database

### Admin Integration
- **Toggle Buttons**: Switch between SOS Map and Location Manager
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper loading indicators
- **Success Feedback**: Confirmation messages

## 🎨 UI Features

### Map Interface
- **Dark Theme**: Matches existing design
- **Navigation Controls**: Zoom, pan, and reset
- **Custom Markers**: Red pins with hover tooltips
- **Responsive Design**: Works on all screen sizes

### Location Management
- **Add Locations**: Via map clicks or sample button
- **View Details**: Location cards with coordinates
- **Real-time Count**: Live display of total locations
- **Refresh Data**: Manual refresh button

### Integration
- **Seamless Toggle**: Switch between map views
- **Consistent Styling**: Matches existing UI components
- **Error Boundaries**: Graceful error handling
- **Loading States**: Proper feedback during operations

## 🔒 Security Notes

- **Demo Mode**: Currently allows all operations for testing
- **Production Ready**: Can be secured with RLS policies
- **API Access**: Uses Supabase anon key (public read/write)
- **Mapbox Token**: Public token for map tiles

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**
   - Check internet connection
   - Verify Mapbox token is valid
   - Check browser console for errors

2. **Database errors**
   - Verify Supabase table exists
   - Check Supabase credentials
   - Ensure RLS policies allow operations

3. **Real-time not working**
   - Check Supabase real-time is enabled
   - Verify subscription is active
   - Check network connectivity

### Debug Commands
```bash
# Check for build errors
npm run build

# Check for linting issues
npm run lint

# Start development server
npm run dev
```

## 📊 Database Operations

### Insert Location
```sql
INSERT INTO locations (name, latitude, longitude) 
VALUES ('Test Location', 40.7128, -74.0060);
```

### Fetch Locations
```sql
SELECT * FROM locations 
ORDER BY created_at DESC;
```

### Real-time Subscription
The app automatically subscribes to database changes and updates the UI in real-time.

## 🎯 Success Criteria

The integration is working correctly when:
- ✅ Map displays with Mapbox tiles
- ✅ Can click to add locations
- ✅ Sample location button works
- ✅ Locations appear as markers
- ✅ Real-time updates work
- ✅ Location cards display correctly
- ✅ Toggle between map views works
- ✅ No console errors

## 🔄 Next Steps

### Potential Enhancements
- **User Authentication**: Add user-specific locations
- **Location Categories**: Organize locations by type
- **Advanced Filtering**: Search and filter locations
- **Export/Import**: CSV export functionality
- **Geofencing**: Location-based alerts
- **Analytics**: Location usage statistics

### Production Considerations
- **RLS Policies**: Implement proper security
- **Rate Limiting**: Prevent abuse
- **Data Validation**: Input sanitization
- **Backup Strategy**: Database backups
- **Monitoring**: Error tracking and analytics

---

**Ready to use!** The integration is complete and functional. Follow the setup instructions to get started. 