import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeospatialService } from '@/lib/services/geospatial';
import { MAPBOX_CONFIG } from '@/lib/mapbox';
import { 
  Zone, 
  GeoSweep, 
  RouteInfo, 
  IsochroneZone, 
  ClusterInfo,
  EmergencyZoneStats,
  GeoSweepConfig,
  ClusteringConfig
} from '@/types/geospatial';
import { MapMarker } from '@/types/sos';
import { 
  Circle, 
  Square, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Building2,
  Route,
  Layers,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Hexagon
} from 'lucide-react';

// Use centralized Mapbox configuration
const MAP_CONFIG = {
  ...MAPBOX_CONFIG,
  style: 'mapbox://styles/mapbox/satellite-v9', // Override to use satellite view
};

// Marker icons mapping
const MARKER_ICONS = {
  sos: '🚨',
  helper: '🟥',
  responder: '🟥',
  hospital: '🏥',
  user: '🟪',
};

interface AdvancedMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarker?: MapMarker | null;
  className?: string;
  showGeoSweep?: boolean;
  showZones?: boolean;
  showClusters?: boolean;
  showRoutes?: boolean;
  showIsochrones?: boolean;
  onZoneSelect?: (zone: Zone) => void;
  onSweepSelect?: (sweep: GeoSweep) => void;
}

export const AdvancedMap: React.FC<AdvancedMapProps> = ({
  markers,
  onMarkerClick,
  selectedMarker,
  className = '',
  showGeoSweep = true,
  showZones = true,
  showClusters = true,
  showRoutes = true,
  showIsochrones = true,
  onZoneSelect,
  onSweepSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [geoSweeps, setGeoSweeps] = useState<GeoSweep[]>([]);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [isochrones, setIsochrones] = useState<IsochroneZone[]>([]);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSweep, setSelectedSweep] = useState<GeoSweep | null>(null);
  const [zoneStats, setZoneStats] = useState<EmergencyZoneStats | null>(null);
  const [drawMode, setDrawMode] = useState<'polygon' | 'circle' | 'rectangle' | null>(null);
  const [sweepRadius, setSweepRadius] = useState(5000); // 5km default
  const [sweepColor, setSweepColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);

  // Configuration - use useMemo to prevent infinite re-renders
  const geoSweepConfig: GeoSweepConfig = useMemo(() => ({
    enabled: showGeoSweep,
    defaultRadius: 5000,
    colors: {
      danger: '#ff0000',
      helper: '#00ff00',
      neutral: '#ffff00',
    },
  }), [showGeoSweep]);

  const clusteringConfig: ClusteringConfig = useMemo(() => ({
    enabled: showClusters,
    maxZoom: 14,
    radius: 100, // meters
    colors: {
      sos: '#ff0000',
      helper: '#00ff00',
      responder: '#0000ff',
      mixed: '#ffff00',
    },
  }), [showClusters]);

  // Initialize map
  useEffect(() => {
    console.log('Map container ref:', mapContainer.current);
    console.log('Map instance:', map.current);
    
    if (!mapContainer.current || map.current) return;

    let timeout: NodeJS.Timeout;

    try {
      console.log('Environment variables check:');
      console.log('VITE_MAPBOX_TOKEN:', import.meta.env.VITE_MAPBOX_TOKEN);
      console.log('VITE_MAPBOX_ACCESS_TOKEN:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
      console.log('MAP_CONFIG.accessToken:', MAP_CONFIG.accessToken);
      console.log('Initializing map with token:', MAP_CONFIG.accessToken ? 'Token available' : 'No token');
      
      mapboxgl.accessToken = MAP_CONFIG.accessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_CONFIG.style,
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        maxZoom: MAP_CONFIG.maxZoom,
        minZoom: MAP_CONFIG.minZoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Initialize draw tool
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        styles: [
          {
            id: 'gl-draw-polygon-fill',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'fill-color': '#ff0000',
              'fill-outline-color': '#ff0000',
              'fill-opacity': 0.3,
            },
          },
          {
            id: 'gl-draw-polygon-stroke',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#ff0000',
              'line-dasharray': [0.2, 2],
              'line-width': 2,
            },
          },
        ],
      });

      map.current.addControl(draw.current, 'top-left');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        loadZones();
        setupEventListeners();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // Add timeout to detect if map fails to load
      timeout = setTimeout(() => {
        if (!mapLoaded) {
          console.error('Map failed to load within 10 seconds');
        }
      }, 10000);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load zones from database
  const loadZones = async () => {
    try {
      const { zones: loadedZones, error } = await GeospatialService.getZones();
      if (error) {
        console.warn('Failed to load zones:', error);
        setZones([]);
      } else {
    setZones(loadedZones);
      }
    } catch (error) {
      console.warn('Error loading zones:', error);
      setZones([]);
    }
  };

  // Setup event listeners
  const setupEventListeners = () => {
    if (!map.current || !draw.current) return;

    // Draw events - MapboxDraw uses map events, not direct draw events
    map.current.on('draw.create', handleDrawCreate);
    map.current.on('draw.update', handleDrawUpdate);
    map.current.on('draw.delete', handleDrawDelete);

    // Map click for GeoSweep
    map.current.on('click', handleMapClick);

    // Zone click
    map.current.on('click', 'zones-fill', handleZoneClick);
    map.current.on('mouseenter', 'zones-fill', handleZoneMouseEnter);
    map.current.on('mouseleave', 'zones-fill', handleZoneMouseLeave);
  };

  // Handle draw creation
  const handleDrawCreate = async (e: any) => {
    const data = draw.current?.getAll();
    if (!data || data.features.length === 0) return;

    const feature = data.features[0];
    const zoneName = prompt('Enter zone name:');
    if (!zoneName) {
      draw.current?.deleteAll();
      return;
    }

    const zoneData = {
      name: zoneName,
      description: `Drawn zone: ${zoneName}`,
      geojson: feature,
      type: feature.geometry.type as 'polygon' | 'circle' | 'rectangle',
      color: '#ff0000',
      opacity: 0.3,
      created_by: 'current-user-id', // Get from auth
      is_active: true,
    };

    const { zone, error } = await GeospatialService.createZone(zoneData);
    if (zone) {
      setZones(prev => [zone, ...prev]);
      draw.current?.deleteAll();
    }
  };

  const handleDrawUpdate = async (e: any) => {
    // Handle zone updates
  };

  const handleDrawDelete = async (e: any) => {
    // Handle zone deletions
  };

  // Handle map click for GeoSweep
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!geoSweepConfig.enabled) return;

    const sweep = GeospatialService.createGeoSweep(
      [e.lngLat.lng, e.lngLat.lat],
      sweepRadius,
      sweepColor
    );

    setGeoSweeps(prev => [...prev, sweep]);
    setSelectedSweep(sweep);
    onSweepSelect?.(sweep);

    // Get responders in sweep
    GeospatialService.getRespondersInSweep(sweep).then(({ count, responders }) => {
      setSelectedSweep(prev => prev ? { ...prev, respondersCount: count } : null);
    });
  };

  // Handle zone interactions
  const handleZoneClick = (e: mapboxgl.MapMouseEvent) => {
    if (!e.features || e.features.length === 0) return;

    const zoneId = e.features[0].properties?.zoneId;
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      onZoneSelect?.(zone);
      loadZoneStats(zoneId);
    }
  };

  const handleZoneMouseEnter = (e: mapboxgl.MapMouseEvent) => {
    if (map.current) {
      map.current.getCanvas().style.cursor = 'pointer';
    }
  };

  const handleZoneMouseLeave = () => {
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  // Load zone statistics
  const loadZoneStats = async (zoneId: string) => {
    const { stats } = await GeospatialService.getZoneStats(zoneId);
    setZoneStats(stats);
  };

  // Add zones to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !showZones) return;

    // Remove existing zones
    if (map.current.getLayer('zones-fill')) map.current.removeLayer('zones-fill');
    if (map.current.getLayer('zones-stroke')) map.current.removeLayer('zones-stroke');
    if (map.current.getSource('zones')) map.current.removeSource('zones');

    if (zones.length === 0) return;

    // Create zones GeoJSON
    const zonesGeoJSON = {
      type: 'FeatureCollection',
      features: zones.map(zone => ({
        type: 'Feature',
        geometry: zone.geojson.geometry,
        properties: {
          zoneId: zone.id,
          name: zone.name,
          color: zone.color,
          opacity: zone.opacity,
        },
      })),
    };

    // Add zones source
    map.current.addSource('zones', {
      type: 'geojson',
      data: zonesGeoJSON as any,
    });

    // Add zones fill layer
    map.current.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'zones',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': ['get', 'opacity'],
      },
    });

    // Add zones stroke layer
    map.current.addLayer({
      id: 'zones-stroke',
      type: 'line',
      source: 'zones',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2,
      },
    });
  }, [zones, mapLoaded, showZones]);

  // Add GeoSweeps to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !showGeoSweep) return;

    // Remove existing sweeps
    if (map.current.getLayer('sweeps-fill')) map.current.removeLayer('sweeps-fill');
    if (map.current.getLayer('sweeps-stroke')) map.current.removeLayer('sweeps-stroke');
    if (map.current.getSource('sweeps')) map.current.removeSource('sweeps');

    if (geoSweeps.length === 0) return;

    // Create sweeps GeoJSON
    const sweepsGeoJSON = {
      type: 'FeatureCollection',
      features: geoSweeps.map(sweep => {
        const circle = turf.circle(sweep.center, sweep.radius / 1000, { units: 'kilometers' });
        return {
          type: 'Feature',
          geometry: circle.geometry,
          properties: {
            sweepId: sweep.id,
            radius: sweep.radius,
            color: sweep.color,
            zoneName: sweep.zoneName,
            respondersCount: sweep.respondersCount,
          },
        };
      }),
    };

    // Add sweeps source
    map.current.addSource('sweeps', {
      type: 'geojson',
      data: sweepsGeoJSON as any,
    });

    // Add sweeps fill layer
    map.current.addLayer({
      id: 'sweeps-fill',
      type: 'fill',
      source: 'sweeps',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.2,
      },
    });

    // Add sweeps stroke layer
    map.current.addLayer({
      id: 'sweeps-stroke',
      type: 'line',
      source: 'sweeps',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    });
  }, [geoSweeps, mapLoaded, showGeoSweep]);

  // Add routes to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoutes) return;

    // Remove existing routes
    routes.forEach((_, index) => {
      const layerId = `route-${index}`;
      const sourceId = `route-source-${index}`;
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    });

    // Add new routes
    routes.forEach((route, index) => {
      if (!map.current) return;

      const layerId = `route-${index}`;
      const sourceId = `route-source-${index}`;

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.polyline,
          },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    });
  }, [routes, mapLoaded, showRoutes]);

  // Add isochrones to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !showIsochrones) return;

    // Remove existing isochrones
    isochrones.forEach((_, index) => {
      const layerId = `isochrone-${index}`;
      const sourceId = `isochrone-source-${index}`;
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    });

    // Add new isochrones
    isochrones.forEach((isochrone, index) => {
      if (!map.current) return;

      const layerId = `isochrone-${index}`;
      const sourceId = `isochrone-source-${index}`;

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: isochrone.geojson,
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'contour'], 5], isochrone.colors[0],
            ['==', ['get', 'contour'], 10], isochrone.colors[1],
            '#ffffff',
          ],
          'fill-opacity': 0.3,
        },
      });
    });
  }, [isochrones, mapLoaded, showIsochrones]);

  // Create clusters
  useEffect(() => {
    if (!clusteringConfig.enabled) return;

    const points = markers.map(marker => ({
      ...marker,
      longitude: marker.longitude,
      latitude: marker.latitude,
      type: marker.type,
    }));

    const newClusters = GeospatialService.createClusters(points, clusteringConfig);
    setClusters(newClusters);
  }, [markers, clusteringConfig]);

  // Add clusters to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !showClusters) return;

    // Remove existing clusters
    if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
    if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
    if (map.current.getSource('clusters')) map.current.removeSource('clusters');

    if (clusters.length === 0) return;

    // Create clusters GeoJSON
    const clustersGeoJSON = {
      type: 'FeatureCollection',
      features: clusters.map(cluster => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: cluster.coordinates,
        },
        properties: {
          clusterId: cluster.id,
          pointCount: cluster.pointCount,
          type: cluster.type,
          color: cluster.color,
        },
      })),
    };

    // Add clusters source
    map.current.addSource('clusters', {
      type: 'geojson',
      data: clustersGeoJSON as any,
    });

    // Add clusters layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters',
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'step',
          ['get', 'pointCount'],
          20, 100,
          30, 750,
          40,
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Add cluster count layer
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters',
      layout: {
        'text-field': ['get', 'pointCount'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });
  }, [clusters, mapLoaded, showClusters]);

  // Control functions
  const toggleDrawMode = (mode: 'polygon' | 'circle' | 'rectangle' | null) => {
    if (!draw.current) return;

    if (drawMode === mode) {
      setDrawMode(null);
      draw.current.changeMode('simple_select');
    } else {
      setDrawMode(mode);
      draw.current.changeMode(`draw_${mode}`);
    }
  };

  const clearSweeps = () => {
    setGeoSweeps([]);
    setSelectedSweep(null);
  };

  const clearRoutes = () => {
    setRoutes([]);
  };

  const clearIsochrones = () => {
    setIsochrones([]);
  };

  const createIsochrone = async (center: [number, number]) => {
    const { isochrones: newIsochrone } = await GeospatialService.getIsochrones(center);
    if (newIsochrone) {
      setIsochrones(prev => [...prev, newIsochrone]);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg" 
        style={{ 
          minHeight: '400px',
          width: '100%',
          height: '100%',
          position: 'relative'
        }} 
      />
      
      {/* Fallback if map fails to load */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-300 text-sm">Loading map...</p>
            <p className="text-gray-400 text-xs mt-2">Vadodara, India</p>
          </div>
        </div>
      )}
      


      {/* Zone Stats Panel */}
      {zoneStats && (
        <div className="absolute top-4 right-4 bg-black/80 border border-cyan-400 rounded-lg p-4 z-10 min-w-64">
          <h3 className="text-sm font-semibold text-cyan-300 mb-4 uppercase tracking-widest">
            Zone Statistics
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Zone:</span>
              <span className="text-white">{zoneStats.zoneName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active SOS:</span>
              <span className="text-red-400">{zoneStats.activeSOSCases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Available Helpers:</span>
              <span className="text-green-400">{zoneStats.availableHelpers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Assigned Responders:</span>
              <span className="text-blue-400">{zoneStats.assignedResponders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Response Time:</span>
              <span className="text-yellow-400">{zoneStats.averageResponseTime} min</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Updated: {new Date(zoneStats.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* GeoSweep Info Panel */}
      {selectedSweep && (
        <div className="absolute bottom-4 left-4 bg-black/80 border border-cyan-400 rounded-lg p-4 z-10 min-w-64">
          <h3 className="text-sm font-semibold text-cyan-300 mb-4 uppercase tracking-widest">
            GeoSweep Info
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Zone:</span>
              <span className="text-white">{selectedSweep.zoneName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Radius:</span>
              <span className="text-white">{selectedSweep.radius}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Responders:</span>
              <span className="text-blue-400">{selectedSweep.respondersCount || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 