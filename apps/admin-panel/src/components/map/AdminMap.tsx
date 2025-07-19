import React, { useEffect, useRef, useState, useCallback } from 'react';
import { mapboxgl, MAPBOX_CONFIG, MARKER_ICONS, MARKER_SIZES, mapUtils } from '@/lib/mapbox';
import { MapMarker, MapFilters, RouteInfo } from '@/types/map';
import { SOSEvent, Helper, Responder, Hospital } from '@/types/sos';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AdminMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  filters?: MapFilters;
  onFiltersChange?: (filters: MapFilters) => void;
  selectedMarker?: MapMarker | null;
  routes?: RouteInfo[];
  className?: string;
}

export const AdminMap: React.FC<AdminMapProps> = ({
  markers,
  onMarkerClick,
  filters = {
    showSOS: true,
    showHelpers: true,
    showResponders: true,
    showHospitals: true,
    showUsers: true,
    showRoutes: true,
    showClusters: true,
    showHeatmap: false,
  },
  onFiltersChange,
  selectedMarker,
  routes = [],
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routesRef = useRef<{ [key: string]: mapboxgl.GeoJSONSource }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.style,
      center: MAPBOX_CONFIG.center,
      zoom: MAPBOX_CONFIG.zoom,
      maxZoom: MAPBOX_CONFIG.maxZoom,
      minZoom: MAPBOX_CONFIG.minZoom,
      pitch: MAPBOX_CONFIG.pitch,
      bearing: MAPBOX_CONFIG.bearing,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Map load event
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Enable 3D globe
      if (map.current) {
        map.current.setProjection('globe');
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when markers array or filters change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers based on filters
    markers.forEach(marker => {
      const filterKey = `show${marker.type.charAt(0).toUpperCase() + marker.type.slice(1)}` as keyof MapFilters;
      if (!filters[filterKey]) return;

      const el = mapUtils.createMarkerElement(marker.type, 'medium');

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map.current!);

      // Add click event
      el.addEventListener('click', () => {
        onMarkerClick?.(marker);
      });

      // Add popup if marker has popup data
      if (marker.popup) {
        mapUtils.addPopupToMarker(
          mapboxMarker,
          marker.popup.title,
          marker.popup.content,
          marker.popup.actions
        );
      }

      // Highlight selected marker
      if (selectedMarker && selectedMarker.id === marker.id) {
        el.style.transform = 'scale(1.2)';
        el.style.filter = 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))';
      }

      markersRef.current[marker.id] = mapboxMarker;
    });
  }, [markers, filters, selectedMarker, mapLoaded, onMarkerClick]);

  // Update routes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old routes
    Object.values(routesRef.current).forEach(source => {
      if (map.current?.getLayer('route-layer')) {
        map.current.removeLayer('route-layer');
      }
      if (map.current?.getSource('route-source')) {
        map.current.removeSource('route-source');
      }
    });
    routesRef.current = {};

    // Add new routes
    routes.forEach((route, index) => {
      if (!map.current) return;

      const routeId = `route-${index}`;
      const sourceId = `route-source-${index}`;
      const layerId = `route-layer-${index}`;

      // Add route source
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

      // Add route layer
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

      routesRef.current[routeId] = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
    });
  }, [routes, mapLoaded]);

  // Fly to selected marker
  useEffect(() => {
    if (selectedMarker && map.current && mapLoaded) {
      mapUtils.flyToLocation(
        map.current,
        [selectedMarker.longitude, selectedMarker.latitude],
        15,
        2000
      );
    }
  }, [selectedMarker, mapLoaded]);

  // Fit map to all visible markers
  const fitMapToMarkers = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    const visibleMarkers = markers.filter(marker => {
      const filterKey = `show${marker.type.charAt(0).toUpperCase() + marker.type.slice(1)}` as keyof MapFilters;
      return filters[filterKey];
    });

    if (visibleMarkers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    visibleMarkers.forEach(marker => {
      bounds.extend([marker.longitude, marker.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
    });
  }, [markers, filters, mapLoaded]);

  // Toggle 3D view
  const toggle3D = useCallback(() => {
    if (!map.current) return;

    const currentPitch = map.current.getPitch();
    const newPitch = currentPitch > 0 ? 0 : 60;
    
    map.current.easeTo({
      pitch: newPitch,
      duration: 1000,
    });
  }, []);

  // Change map style
  const changeMapStyle = useCallback((styleUrl: string) => {
    if (!map.current) return;

    map.current.setStyle(styleUrl);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      


      {/* Map Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white rounded-lg p-3 z-10">
        <div className="text-xs">
          <p>Markers: {markers.length}</p>
          <p>Routes: {routes.length}</p>
          <p>Zoom: {map.current?.getZoom().toFixed(1) || '0'}</p>
        </div>
      </div>


    </div>
  );
}; 