import mapboxgl from 'mapbox-gl';

// Initialize Mapbox with your token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw';

export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [73.1812, 22.3072] as [number, number], // Vadodara coordinates
  zoom: 12,
  maxZoom: 18,
  minZoom: 8,
  pitch: 0,
  bearing: 0,
};

export const MARKER_COLORS = {
  sos: '#ff4444',
  helper: '#4444ff',
  responder: '#44ff44',
  hospital: '#ffff44',
  user: '#ff8844',
} as const;

export const MARKER_ICONS = {
  sos: '🚨',
  helper: '🆘',
  responder: '🚑',
  hospital: '🏥',
  user: '👤',
} as const;

export const MARKER_SIZES = {
  small: 20,
  medium: 30,
  large: 40,
} as const;

// Map styles available
export const MAP_STYLES = [
  {
    id: 'dark-v11',
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    dark: true,
  },
  {
    id: 'light-v11',
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    dark: false,
  },
  {
    id: 'streets-v12',
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    dark: false,
  },
  {
    id: 'satellite-v9',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    dark: true,
  },
  {
    id: 'satellite-streets-v12',
    name: 'Satellite Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: true,
  },
];

// Default map controls configuration
export const DEFAULT_MAP_CONTROLS = {
  showNavigation: true,
  showFullscreen: true,
  showGeolocate: true,
  showScale: true,
  showAttribution: true,
};

// Default map interaction configuration
export const DEFAULT_MAP_INTERACTION = {
  scrollZoom: true,
  boxZoom: true,
  dragRotate: true,
  dragPan: true,
  keyboard: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
};

// Cluster configuration
export const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 50,
  minPoints: 3,
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40
    ]
  }
};

// Heatmap configuration
export const HEATMAP_CONFIG = {
  radius: 30,
  maxZoom: 9,
  paint: {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'intensity'],
      0, 0,
      6, 1
    ],
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      9, 3
    ],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      9, 20
    ],
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, 1,
      9, 0
    ]
  }
};

// Route calculation configuration
export const ROUTE_CONFIG = {
  profile: 'driving',
  alternatives: false,
  annotations: ['distance', 'duration'],
  overview: 'full',
  steps: true,
};

// 3D Globe configuration
export const GLOBE_CONFIG = {
  enable: true,
  atmosphereColor: 'rgb(36, 92, 223)',
  atmosphereAltitude: 0.15,
  atmosphereHighQuality: true,
  atmosphereSunIntensity: 15,
};

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: 2000,
  easing: (t: number) => t * (2 - t), // easeOutQuart
  flyToOptions: {
    curve: 1.42,
    speed: 1.2,
    screenSpeed: 1.2,
  },
};

// Utility functions for map operations
export const mapUtils = {
  // Calculate distance between two points
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Format distance for display
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },

  // Format duration for display
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  // Get bounds from coordinates
  getBounds: (coordinates: [number, number][]): mapboxgl.LngLatBounds => {
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    return bounds;
  },

  // Animate to location with Earth-to-Map effect
  flyToLocation: (
    map: mapboxgl.Map,
    center: [number, number],
    zoom: number = 15,
    duration: number = 2000
  ) => {
    // Start from a high altitude (globe view)
    map.flyTo({
      center,
      zoom: 2,
      pitch: 0,
      bearing: 0,
      duration: duration / 2,
      easing: (t) => t * (2 - t),
    });

    // Then zoom in to the location
    setTimeout(() => {
      map.flyTo({
        center,
        zoom,
        pitch: 45,
        bearing: 0,
        duration: duration / 2,
        easing: (t) => t * (2 - t),
      });
    }, duration / 2);
  },

  // Create a marker element
  createMarkerElement: (
    type: keyof typeof MARKER_ICONS,
    size: keyof typeof MARKER_SIZES = 'medium'
  ): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = MARKER_ICONS[type];
    el.style.fontSize = `${MARKER_SIZES[size]}px`;
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.style.pointerEvents = 'auto';
    return el;
  },

  // Add popup to marker
  addPopupToMarker: (
    marker: mapboxgl.Marker,
    title: string,
    content: string,
    actions?: Array<{
      label: string;
      action: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>
  ) => {
    const popupContent = document.createElement('div');
    popupContent.className = 'p-4 max-w-xs';
    
    popupContent.innerHTML = `
      <h3 class="font-semibold text-gray-900 mb-2">${title}</h3>
      <p class="text-gray-600 text-sm mb-3">${content}</p>
      ${actions ? `
        <div class="flex gap-2">
          ${actions.map(action => `
            <button 
              class="px-3 py-1 text-xs rounded ${
                action.variant === 'primary' ? 'bg-blue-500 text-white' :
                action.variant === 'danger' ? 'bg-red-500 text-white' :
                'bg-gray-200 text-gray-700'
              } hover:opacity-80"
              onclick="window.handleMarkerAction('${action.label}')"
            >
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
    }).setDOMContent(popupContent);

    marker.setPopup(popup);
  },
};

// Export mapboxgl for use in components
export { mapboxgl }; 