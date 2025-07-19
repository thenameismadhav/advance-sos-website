# Advanced Mapbox Features for SOS Admin Panel

## 🚀 Overview

The SOS Admin Panel now includes world-class, GIS-powered features using Mapbox GL JS, Turf.js, and advanced geospatial analysis. This document outlines all the implemented features and how to use them.

## 📦 Dependencies Added

```bash
npm install @turf/turf @mapbox/mapbox-gl-draw mapbox-gl
```

## 🗺️ Core Features

### 1. GeoSweep Visualization

**What it does:**
- Creates circular radius sweeps around selected points
- Configurable radius (1km - 20km)
- Color-coded sweeps (red for danger, green for helpers, yellow for neutral)
- Real-time responder count within sweep area

**How to use:**
1. Click anywhere on the map to create a GeoSweep
2. Adjust radius using the slider in the controls panel
3. Change sweep color using the color picker
4. View responder count in the sweep info panel

**Technical Details:**
- Uses Turf.js for circle generation and point-in-polygon analysis
- Bounding box optimization for database queries
- Real-time statistics calculation

### 2. Zone Drawing Tool

**What it does:**
- Draw polygons, circles, and rectangles on the map
- Save zones to Supabase database
- Edit and delete existing zones
- Visual zone management with color coding

**How to use:**
1. Select drawing mode (polygon, circle, rectangle)
2. Draw on the map
3. Enter zone name and description
4. Save to database
5. Manage zones through the Zone Management Panel

**Database Schema:**
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  geojson JSONB NOT NULL,
  type TEXT NOT NULL,
  color TEXT DEFAULT '#ff0000',
  opacity REAL DEFAULT 0.3,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Routing & ETA

**What it does:**
- Calculate routes between helpers and users
- Display ETA and distance information
- Visual route lines on the map
- Real-time routing using Mapbox Directions API

**How to use:**
1. Select a helper and user
2. Route is automatically calculated
3. View ETA and distance in the route info panel
4. Route line displayed on map

**API Integration:**
- Mapbox Directions API v5
- Driving directions with full geometry
- Real-time traffic consideration

### 4. Isochrone Zone Analysis

**What it does:**
- Shows reachable areas from a point in 5 and 10 minutes
- Different colors for different time ranges
- Overlay on city map with transparency
- Useful for emergency response planning

**How to use:**
1. Click "Create Isochrone" button
2. Select center point
3. View 5-minute (red) and 10-minute (green) zones
4. Clear isochrones when done

**API Integration:**
- Mapbox Isochrone API v1
- Driving-based isochrones
- Polygon geometry output

### 5. Marker Clustering

**What it does:**
- Groups nearby markers into clusters
- Color-coded clusters by type
- Zoom to expand clusters
- Performance optimization for large datasets

**Configuration:**
```typescript
const clusteringConfig = {
  enabled: true,
  maxZoom: 14,
  radius: 100, // meters
  colors: {
    sos: '#ff0000',
    helper: '#00ff00',
    responder: '#0000ff',
    mixed: '#ffff00',
  },
};
```

### 6. Emergency Zone Statistics

**What it does:**
- Real-time statistics for selected zones
- Active SOS cases count
- Available helpers and responders
- Average response time calculation
- Auto-refresh every 15 seconds

**Statistics Included:**
- Active SOS cases
- Available helpers
- Assigned responders
- Average response time
- Zone health score

## 🛠️ Technical Implementation

### File Structure

```
src/
├── components/
│   ├── map/
│   │   ├── AdvancedMap.tsx          # Main advanced map component
│   │   └── EnhancedAdminMap.tsx     # Admin dashboard integration
│   └── admin/
│       ├── ZoneManagementPanel.tsx  # Zone CRUD operations
│       └── EmergencyZoneStatsPanel.tsx # Real-time statistics
├── lib/
│   └── services/
│       └── geospatial.ts            # Geospatial service layer
└── types/
    └── geospatial.ts                # TypeScript definitions
```

### Key Components

#### AdvancedMap.tsx
- Main map component with all advanced features
- Mapbox GL JS integration
- Turf.js for geospatial calculations
- Real-time data visualization

#### GeospatialService.ts
- Database operations for zones
- Mapbox API integrations
- Geospatial calculations
- Real-time subscriptions

#### ZoneManagementPanel.tsx
- Zone creation, editing, deletion
- Visual zone management
- Search and filtering
- Color and opacity controls

#### EmergencyZoneStatsPanel.tsx
- Real-time zone statistics
- Auto-refresh functionality
- Trend analysis
- Health scoring

## 🎯 Usage Examples

### Creating a GeoSweep
```typescript
// Click on map to create sweep
const sweep = GeospatialService.createGeoSweep(
  [73.1812, 22.3072], // longitude, latitude
  5000,               // radius in meters
  '#ff0000'           // color
);

// Get responders in sweep
const { count, responders } = await GeospatialService.getRespondersInSweep(sweep);
```

### Drawing a Zone
```typescript
// Create zone from drawn geometry
const zoneData = {
  name: 'Emergency Zone A',
  description: 'High-priority response area',
  geojson: drawnGeometry,
  type: 'polygon',
  color: '#ff0000',
  opacity: 0.3,
  created_by: 'user-id',
  is_active: true,
};

const { zone } = await GeospatialService.createZone(zoneData);
```

### Getting Zone Statistics
```typescript
// Get real-time zone statistics
const { stats } = await GeospatialService.getZoneStats(zoneId);

console.log(`Active SOS: ${stats.activeSOSCases}`);
console.log(`Available Helpers: ${stats.availableHelpers}`);
console.log(`Avg Response Time: ${stats.averageResponseTime} min`);
```

## 🔧 Configuration

### Environment Variables
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Mapbox Configuration
```typescript
const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [73.1812, 22.3072], // Vadodara
  zoom: 12,
  maxZoom: 18,
  minZoom: 8,
};
```

## 🧪 Testing

### Debug Features
- Toggle raw GeoJSON display
- Show bounding boxes
- Display distance calculations
- Log API responses

### Test Data
- Sample zones in database
- Test helpers and responders
- Mock SOS events
- Various geographic locations

## 🚨 Performance Considerations

### Optimization Strategies
- Bounding box queries for large datasets
- Marker clustering for performance
- Lazy loading of zone data
- Efficient GeoJSON handling

### Memory Management
- Cleanup of map layers
- Proper event listener removal
- Efficient marker management
- Database connection pooling

## 🔮 Future Enhancements

### Planned Features
- Heatmap visualization
- 3D terrain analysis
- Advanced routing algorithms
- Predictive analytics
- Mobile optimization
- Offline capabilities

### API Integrations
- Weather data overlay
- Traffic pattern analysis
- Population density data
- Emergency service locations

## 📚 Resources

### Documentation
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Turf.js](https://turfjs.org/)
- [Mapbox Draw](https://github.com/mapbox/mapbox-gl-draw)

### APIs
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Mapbox Isochrone API](https://docs.mapbox.com/api/navigation/isochrone/)

### Examples
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Turf.js Examples](https://turfjs.org/docs/)

## 🎉 Conclusion

The advanced Mapbox features provide a comprehensive GIS solution for emergency response management. The system is designed to be scalable, performant, and user-friendly while providing powerful geospatial analysis capabilities.

For support or questions, refer to the individual component documentation or the Mapbox/Turf.js official documentation. 