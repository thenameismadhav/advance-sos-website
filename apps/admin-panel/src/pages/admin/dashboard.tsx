import React, { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedAdminMap } from '@/components/map/EnhancedAdminMap';
import { APIService } from '@/lib/services/api';
import { RealtimeService } from '@/lib/services/realtime';
import { SOSEvent, Helper, Responder, Hospital, MapMarker } from '@/types/sos';
import { MapFilters } from '@/types/map';
import { formatRelativeTime, getEmergencyTypeColor, getStatusColor } from '@/lib/utils';
import { MapPin, Users, User, AlertTriangle, Globe, Layers, Keyboard, Activity, Clock, Phone, Star, ChevronDown, Filter, Shield, Zap, Settings, Database, BarChart3, Bell } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [sosEvents, setSosEvents] = useState<SOSEvent[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapFilters, setMapFilters] = useState<MapFilters>({
    showSOS: true,
    showHelpers: true,
    showResponders: true,
    showHospitals: true,
    showUsers: false,
    showRoutes: true,
    showClusters: true,
    showHeatmap: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    activeSOS: 0,
    totalHelpers: 0,
    availableHelpers: 0,
    totalResponders: 0,
    availableResponders: 0,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isMapPanelsOpen, setIsMapPanelsOpen] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [geoSweepRadius, setGeoSweepRadius] = useState(5000);
  const [selectedZoneType, setSelectedZoneType] = useState('circle');
  const [mapStyle, setMapStyle] = useState('satellite');

  // Trigger map resize when overlay state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [isMapPanelsOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filters-dropdown')) {
        setIsFiltersOpen(false);
      }
      if (!target.closest('.system-status-dropdown')) {
        setIsSystemStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, helpersRes, respondersRes, hospitalsRes] = await Promise.all([
          APIService.getSOSEvents(),
          APIService.getHelpers(),
          APIService.getResponders(),
          APIService.getHospitals(),
        ]);

        if (!eventsRes.error) setSosEvents(eventsRes.events);
        if (!helpersRes.error) setHelpers(helpersRes.helpers);
        if (!respondersRes.error) setResponders(respondersRes.responders);
        if (!hospitalsRes.error) setHospitals(hospitalsRes.hospitals);

        updateStats(eventsRes.events, helpersRes.helpers, respondersRes.responders);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    const realtimeService = new RealtimeService();

    realtimeService.subscribeToAll({
      onSOSEvent: (payload) => {
        console.log('SOS Event update:', payload);
        setSosEvents(prev => {
          const index = prev.findIndex(e => e.id === payload.new.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            return [payload.new, ...prev];
          }
        });
      },
      onHelper: (payload) => {
        console.log('Helper update:', payload);
        setHelpers(prev => {
          const index = prev.findIndex(h => h.id === payload.new.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            return [...prev, payload.new];
          }
        });
      },
      onResponder: (payload) => {
        console.log('Responder update:', payload);
        setResponders(prev => {
          const index = prev.findIndex(r => r.id === payload.new.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            return [...prev, payload.new];
          }
        });
      },
    });

    return () => {
      realtimeService.unsubscribe();
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const newMarkers: MapMarker[] = [];

    // Add SOS event markers
    sosEvents.forEach(event => {
      newMarkers.push({
        id: `sos-${event.id}`,
        type: 'sos',
        latitude: event.latitude,
        longitude: event.longitude,
        data: event,
        popup: {
          title: `SOS Event - ${event.emergency_type.toUpperCase()}`,
          content: `
            <div class="space-y-2">
              <p><strong>Status:</strong> <span class="${getStatusColor(event.status)}">${event.status}</span></p>
              <p><strong>Priority:</strong> ${event.priority}</p>
              <p><strong>Description:</strong> ${event.description || 'No description'}</p>
              <p><strong>Created:</strong> ${formatRelativeTime(event.created_at)}</p>
              ${event.user ? `<p><strong>User:</strong> ${event.user.name}</p>` : ''}
            </div>
          `,
          actions: [
            {
              label: 'View Details',
              action: () => console.log('View SOS details:', event.id),
              variant: 'primary',
            },
            {
              label: 'Assign Helper',
              action: () => console.log('Assign helper to:', event.id),
              variant: 'secondary',
            },
          ],
        },
      });
    });

    // Add helper markers
    helpers.forEach(helper => {
      newMarkers.push({
        id: `helper-${helper.id}`,
        type: 'helper',
        latitude: helper.latitude,
        longitude: helper.longitude,
        data: helper,
        popup: {
          title: `Helper - ${helper.name}`,
          content: `
            <div class="space-y-2">
              <p><strong>Status:</strong> <span class="${getStatusColor(helper.status)}">${helper.status}</span></p>
              <p><strong>Phone:</strong> ${helper.phone}</p>
              <p><strong>Rating:</strong> ${helper.rating}/5.0</p>
              <p><strong>Total Helps:</strong> ${helper.total_helps}</p>
              <p><strong>Emergency Types:</strong> ${helper.emergency_types.join(', ')}</p>
            </div>
          `,
          actions: [
            {
              label: 'View Profile',
              action: () => console.log('View helper profile:', helper.id),
              variant: 'primary',
            },
            {
              label: 'Contact',
              action: () => console.log('Contact helper:', helper.phone),
              variant: 'secondary',
            },
          ],
        },
      });
    });

    // Add responder markers
    responders.forEach(responder => {
      newMarkers.push({
        id: `responder-${responder.id}`,
        type: 'responder',
        latitude: responder.latitude,
        longitude: responder.longitude,
        data: responder,
        popup: {
          title: `Responder - ${responder.name}`,
          content: `
            <div class="space-y-2">
              <p><strong>Organization:</strong> ${responder.organization}</p>
              <p><strong>Department:</strong> ${responder.department}</p>
              <p><strong>Status:</strong> <span class="${getStatusColor(responder.status)}">${responder.status}</span></p>
              <p><strong>Phone:</strong> ${responder.phone}</p>
              <p><strong>Emergency Types:</strong> ${responder.emergency_types.join(', ')}</p>
            </div>
          `,
          actions: [
            {
              label: 'View Profile',
              action: () => console.log('View responder profile:', responder.id),
              variant: 'primary',
            },
            {
              label: 'Contact',
              action: () => console.log('Contact responder:', responder.phone),
              variant: 'secondary',
            },
          ],
        },
      });
    });

    // Add hospital markers
    hospitals.forEach(hospital => {
      newMarkers.push({
        id: `hospital-${hospital.id}`,
        type: 'hospital',
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        data: hospital,
        popup: {
          title: `Hospital - ${hospital.name}`,
          content: `
            <div class="space-y-2">
              <p><strong>Phone:</strong> ${hospital.phone}</p>
              <p><strong>Address:</strong> ${hospital.address}</p>
              <p><strong>24 Hours:</strong> ${hospital.is_24_hours ? 'Yes' : 'No'}</p>
              <p><strong>Services:</strong> ${hospital.emergency_services?.join(', ') || 'None'}</p>
            </div>
          `,
          actions: [
            {
              label: 'View Details',
              action: () => console.log('View hospital details:', hospital.id),
              variant: 'primary',
            },
            {
              label: 'Contact',
              action: () => console.log('Contact hospital:', hospital.phone),
              variant: 'secondary',
            },
          ],
        },
      });
    });

    setMarkers(newMarkers);
  }, [sosEvents, helpers, responders, hospitals]);

  // Update stats
  const updateStats = (events: SOSEvent[], helpers: Helper[], responders: Responder[]) => {
    setStats({
      activeSOS: events.filter(e => e.status === 'active').length,
      totalHelpers: helpers.length,
      availableHelpers: helpers.filter(h => h.status === 'available').length,
      totalResponders: responders.length,
      availableResponders: responders.filter(r => r.status === 'available').length,
    });
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  // Map Control Functions
  const handleGeoSweepRadiusChange = (value: number) => {
    setGeoSweepRadius(value);
    // Here you would trigger the actual geosweep functionality
    console.log('GeoSweep radius changed to:', value);
  };

  const handleClearSweeps = () => {
    // Clear all geosweeps
    console.log('Clearing all sweeps');
  };

  const handleZoneTypeChange = (type: string) => {
    setSelectedZoneType(type);
    console.log('Zone type changed to:', type);
  };

  const handleClearRoutes = () => {
    // Clear all routes
    console.log('Clearing all routes');
  };

  const handleCreateIsochrone = () => {
    // Create isochrone
    console.log('Creating isochrone');
  };

  const handleClearIsochrones = () => {
    // Clear all isochrones
    console.log('Clearing all isochrones');
  };

  const handleMapStyleChange = (style: string) => {
    setMapStyle(style);
    // Here you would change the actual map style
    console.log('Map style changed to:', style);
  };

  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.zoomOut();
    }
  };

  const handleFitAll = () => {
    if (mapRef) {
      // Fit all markers in view
      console.log('Fitting all markers in view');
    }
  };

  const handleCenter = () => {
    if (mapRef) {
      // Center map on current location
      console.log('Centering map');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 shadow-[0_0_20px_#00fff7]"></div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-black font-mono text-white p-4 grid-bg">
        {/* Header Status Bar */}
        <div className="flex justify-between items-center border-b border-cyan-400 pb-2 mb-4 shadow-[0_0_8px_#00fff7]">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-widest text-cyan-300">SOS HQ</span>
            
            {/* Map Filters Dropdown */}
            <div className="relative filters-dropdown">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-400 rounded hover:bg-cyan-500/30 transition-all"
              >
                <Filter className="w-4 h-4" />
                MAP FILTERS
                <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFiltersOpen && (
                <div className="dropdown-fixed top-full left-0 mt-2 bg-black border border-cyan-400 rounded-lg shadow-[0_0_15px_#00fff7] p-3 z-[999] min-w-48">
                  <h4 className="text-xs font-medium text-cyan-300 mb-3 uppercase tracking-widest">Layer Controls</h4>
                  <div className="space-y-2">
                    {Object.entries(mapFilters).map(([key, value]) => {
                      if (key.startsWith('show')) {
                        const label = key.replace('show', '');
                        return (
                          <label key={key} className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs text-gray-300 capitalize">{label}</span>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => {
                                setMapFilters({
                                  ...mapFilters,
                                  [key]: e.target.checked,
                                });
                              }}
                              className="rounded text-cyan-400 bg-black border-cyan-400 focus:ring-cyan-400"
                            />
                          </label>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-6 text-sm items-center">
            <span className="text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              STATUS: OPERATIONAL
            </span>
            <span className="text-green-400">POWER: STABLE</span>
            <span className="text-green-400">SECURITY: SECURE</span>
            
            {/* System Status Button in Header */}
            <div className="relative system-status-dropdown">
              <button
                onClick={() => {
                  console.log('System Status button clicked, current state:', isSystemStatusOpen);
                  setIsSystemStatusOpen(!isSystemStatusOpen);
                }}
                className={`flex items-center gap-2 px-3 py-1 text-xs border rounded transition-all shadow-[0_0_8px_#00fff7] ${
                  isSystemStatusOpen 
                    ? 'bg-cyan-500/40 text-cyan-200 border-cyan-300' 
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span className="uppercase tracking-widest font-medium">
                  SYSTEM {isSystemStatusOpen ? '(OPEN)' : '(CLOSED)'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isSystemStatusOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* System Status Dropdown Panel */}
              {isSystemStatusOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-black border border-cyan-400 rounded-lg shadow-[0_0_15px_#00fff7] p-4 z-[999] max-h-96 overflow-y-auto" style={{minHeight: '200px'}}>
                  <div className="text-center text-cyan-300 text-sm mb-3 border-b border-cyan-400/30 pb-2">
                    🔧 SYSTEM STATUS PANEL - HEADER INTEGRATION
                  </div>
                  <div className="space-y-4">
                    {/* System Health */}
                    <div className="border border-cyan-400/50 rounded p-3 bg-black/50">
                      <h3 className="text-sm text-cyan-300 mb-3">SYSTEM HEALTH</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Database Connection:</span>
                          <span className="text-green-400">Connected & Stable</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mapbox Integration:</span>
                          <span className="text-green-400">Online & Responsive</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Realtime Services:</span>
                          <span className="text-green-400">Active & Syncing</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage Systems:</span>
                          <span className="text-green-400">Ready & Optimized</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">API Endpoints:</span>
                          <span className="text-green-400">All Operational</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Security Protocols:</span>
                          <span className="text-green-400">Active & Secure</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Backup Systems:</span>
                          <span className="text-green-400">Synchronized</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Load Balancing:</span>
                          <span className="text-green-400">Optimal Performance</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="border border-cyan-400/50 rounded p-3 bg-black/50">
                      <h3 className="text-sm text-cyan-300 mb-3">PERFORMANCE METRICS</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">CPU Usage:</span>
                          <span className="text-green-400">23%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Memory Usage:</span>
                          <span className="text-yellow-400">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network Latency:</span>
                          <span className="text-green-400">12ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Response Time:</span>
                          <span className="text-green-400">45ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Connections:</span>
                          <span className="text-blue-400">1,247</span>
                        </div>
                      </div>
                    </div>

                    {/* System Alerts */}
                    <div className="border border-cyan-400/50 rounded p-3 bg-black/50">
                      <h3 className="text-sm text-cyan-300 mb-3">SYSTEM ALERTS</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400">All systems operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-yellow-400">Memory usage above 60%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400">Backup completed successfully</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <span className="text-cyan-300">{currentTime.toLocaleTimeString()}</span>
            <span className="text-cyan-300">{currentTime.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Layout - Grid System */}
        <div className="grid grid-cols-4 grid-rows-2 h-[calc(100vh-120px)] gap-4" style={{overflow: 'visible'}}>
          
          {/* Helpers & Responders Panel - Top Left */}
          <div className="col-span-1 row-span-1 border border-cyan-400 rounded-lg shadow-[0_0_8px_#00fff7] bg-black/80 backdrop-blur-sm panel-container">
            {/* Helpers & Responders Panel */}
            <div className="panel-scroll">
              <div className="panel-content">
                <div className="panel-header">
                  <h2 className="uppercase text-cyan-300 tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    HELPERS & RESPONDERS
                  </h2>
                </div>
                
                {/* Location Card */}
                <div className="border border-cyan-400/50 rounded p-3 mb-4 bg-black/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-300">Vadodara, India</span>
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xs text-gray-400 mb-1">22.3321, 73.1586</div>
                  <div className="text-xs text-gray-400 mb-2">Accuracy: ±5000m</div>
                  <div className="text-xs text-gray-400">Updated: {currentTime.toLocaleTimeString()}</div>
                </div>

                {/* Active Responders */}
                <div className="border border-cyan-400/50 rounded p-3 mb-4 bg-black/50">
                  <h3 className="text-sm text-cyan-300 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    ACTIVE RESPONDERS
                  </h3>
                  <div className="space-y-2">
                    {responders.filter(r => r.status === 'active').slice(0, 5).map((responder) => (
                      <div key={responder.id} className="flex items-center justify-between text-xs p-2 border border-cyan-400/10 rounded hover:bg-cyan-500/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs">
                            {responder.id.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-white">{responder.name}</div>
                            <div className="text-gray-400 text-xs">{responder.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-1 rounded text-xs ${
                            responder.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            responder.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {responder.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {responders.filter(r => r.status === 'active').length === 0 && (
                      <div className="text-xs text-gray-500">No active responders</div>
                    )}
                  </div>
                </div>

                {/* All Helpers */}
                <div className="border border-cyan-400/50 rounded p-3 bg-black/50">
                  <h3 className="text-sm text-cyan-300 mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    ALL HELPERS
                  </h3>
                  <div className="space-y-2">
                    {helpers.slice(0, 8).map((helper) => (
                      <div key={helper.id} className="flex items-center justify-between text-xs p-2 border border-cyan-400/10 rounded hover:bg-cyan-500/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs">
                            {helper.id.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-white">{helper.name}</div>
                            <div className="text-gray-400 text-xs">{helper.specialization}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-1 rounded text-xs ${
                            helper.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            helper.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {helper.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Geo-Spatial View Panel - Center (spans 2x2) */}
          <div className="col-span-2 row-span-2 border border-cyan-400 rounded-lg shadow-[0_0_8px_#00fff7] bg-black/80 backdrop-blur-sm">
            {/* Geo-Spatial View Panel */}
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="p-3 border-b border-cyan-400/30">
                <h2 className="uppercase text-cyan-300 tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  GEO-SPATIAL VIEW
                </h2>
              </div>
              
              {/* Top Control Bar */}
              <div className="p-3 border-b border-cyan-400/30 bg-black/50">
                <div className="flex items-center justify-between">
                  {/* Map Type Tabs */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-cyan-500/30 text-cyan-200 border border-cyan-400 rounded hover:bg-cyan-500/40 transition-all">
                      <Globe className="w-3 h-3 inline mr-1" />
                      SOS MAP
                    </button>
                    <button className="px-3 py-1 text-xs bg-black/50 text-gray-300 border border-gray-600 rounded hover:bg-gray-600/30 transition-all">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      LOCATION MANAGER
                    </button>
                    <button className="px-3 py-1 text-xs bg-black/50 text-gray-300 border border-gray-600 rounded hover:bg-gray-600/30 transition-all">
                      <Layers className="w-3 h-3 inline mr-1" />
                      SUPABASE MAP
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleZoomIn}
                      className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all"
                      title="Zoom In"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleZoomOut}
                      className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all"
                      title="Zoom Out"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleFitAll}
                      className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all"
                      title="Fit All"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleCenter}
                      className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all"
                      title="Center Map"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Map Container */}
              <div className="flex-1 relative">
                <EnhancedAdminMap
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                  mapFilters={mapFilters}
                  onMapLoad={setMapRef}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* User & Victim Details Panel - Top Right */}
          <div className="col-span-1 row-span-1 border border-cyan-400 rounded-lg shadow-[0_0_8px_#00fff7] bg-black/80 backdrop-blur-sm panel-container">
            {/* User & Victim Details */}
            <div className="panel-scroll">
              <div className="panel-content">
                <div className="panel-header">
                  <h2 className="uppercase text-cyan-300 tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4" />
                    USER & VICTIM DETAILS
                  </h2>
                </div>
                
                {/* Emergency Statistics Card */}
                <div className="border border-cyan-400/50 rounded p-3 mb-4 bg-black/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-300">Emergency Statistics</span>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-500 mb-1">{stats.activeSOS} Active</div>
                  <div className="text-xs text-gray-400 mb-1">Total SOS Events: {sosEvents.length}</div>
                  <div className="text-xs text-gray-400">Critical Cases: {sosEvents.filter(e => e.priority === 1).length}</div>
                </div>

                {/* Active Emergency Cases */}
                <div className="border border-cyan-400/50 rounded p-3 mb-4 bg-black/50">
                  <h3 className="text-sm text-cyan-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    ACTIVE EMERGENCIES
                  </h3>
                  <div className="space-y-2">
                    {sosEvents.filter(e => e.status === 'active').slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between text-xs p-2 border border-cyan-400/10 rounded hover:bg-cyan-500/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center text-xs">
                            !
                          </div>
                          <div>
                            <div className="text-white">{event.user?.name || 'Unknown User'}</div>
                            <div className="text-gray-400 text-xs">{event.emergency_type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-1 rounded text-xs ${
                            event.priority === 1 ? 'bg-red-500/20 text-red-400' :
                            event.priority === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            P{event.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {sosEvents.filter(e => e.status === 'active').length === 0 && (
                      <div className="text-xs text-gray-500">No active emergencies</div>
                    )}
                  </div>
                </div>

                {/* Victim Details for Scrolling Demo */}
                <div className="border border-cyan-400/50 rounded p-3 bg-black/50 mt-4">
                  <h3 className="text-sm text-cyan-300 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    VICTIM PROFILES
                  </h3>
                  <div className="space-y-2">
                    {sosEvents.slice(0, 12).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between text-xs p-2 border border-cyan-400/10 rounded hover:bg-cyan-500/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white">{event.user?.name || 'Unknown User'}</div>
                            <div className="text-gray-400 text-xs">ID: {event.id.slice(0, 8)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-1 rounded text-xs ${
                            event.emergency_type === 'fire' ? 'bg-red-500/20 text-red-400' :
                            event.emergency_type === 'medical' ? 'bg-blue-500/20 text-blue-400' :
                            event.emergency_type === 'accident' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {event.emergency_type}
                          </span>
                          <span className={`px-1 rounded text-xs ${
                            event.status === 'active' ? 'bg-red-500/20 text-red-400' :
                            event.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Type Breakdown */}
                <div className="border border-cyan-400/50 rounded p-3 bg-black/50 mt-4">
                  <h3 className="text-sm text-cyan-300 mb-2">EMERGENCY BREAKDOWN</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Medical Emergencies:</span>
                      <span className="text-blue-400">{sosEvents.filter(e => e.emergency_type === 'medical').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fire Incidents:</span>
                      <span className="text-red-400">{sosEvents.filter(e => e.emergency_type === 'fire').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accidents:</span>
                      <span className="text-yellow-400">{sosEvents.filter(e => e.emergency_type === 'accident').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Other:</span>
                      <span className="text-purple-400">{sosEvents.filter(e => !['medical', 'fire', 'accident'].includes(e.emergency_type)).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Command & Control - Bottom Left */}
          <div className="col-span-1 row-span-1 border border-cyan-400 rounded-lg shadow-[0_0_8px_#00fff7] bg-black/80 backdrop-blur-sm panel-container">
            {/* Command & Control */}
            <div className="panel-scroll">
              <div className="panel-content">
                <div className="panel-header">
                  <h2 className="uppercase text-cyan-300 tracking-widest flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    COMMAND & CONTROL
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Keyboard className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">AI Command Center</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Map Overlays & Layers</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Global View & Analytics</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Data Layers & Visualization</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Real-time Monitoring Dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Emergency Communication System</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Star className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Priority Management & Routing</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Response Time Optimization</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Security Protocols & Access Control</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-cyan-400/30 rounded hover:bg-cyan-500/10 cursor-pointer">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">System Performance & Optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live SOS Feed - Bottom Right */}
          <div className="col-span-1 row-span-1 border border-cyan-400 rounded-lg shadow-[0_0_8px_#00fff7] bg-black/80 backdrop-blur-sm panel-container">
            {/* Live SOS Feed */}
            <div className="panel-scroll">
              <div className="panel-content">
                <div className="panel-header">
                  <h2 className="uppercase text-cyan-300 tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    LIVE SOS FEED
                  </h2>
                </div>
                
                <div className="space-y-2">
                  {sosEvents.slice(0, 20).map((event, index) => (
                    <div key={event.id} className="text-xs border-l-2 border-cyan-400 pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1 rounded ${
                          event.emergency_type === 'fire' ? 'bg-red-500/20 text-red-400' :
                          event.emergency_type === 'medical' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          [{event.emergency_type.toUpperCase()}]
                        </span>
                        <span className="text-gray-400">{formatRelativeTime(event.created_at)}</span>
                      </div>
                      <div className="text-white">Sector {index + 1} - {event.user?.name || 'Unknown User'}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        Location: {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
                      </div>
                    </div>
                  ))}
                  {sosEvents.length === 0 && (
                    <div className="text-xs text-gray-500">No SOS events</div>
                  )}
                </div>

                {/* Additional Feed Data for Scrolling Demo */}
                <div className="border border-cyan-400/50 rounded p-3 bg-black/50 mt-4">
                  <h3 className="text-sm text-cyan-300 mb-2">FEED STATISTICS</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Events Today:</span>
                      <span className="text-white">{sosEvents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Alerts:</span>
                      <span className="text-red-400">{sosEvents.filter(e => e.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolved:</span>
                      <span className="text-green-400">{sosEvents.filter(e => e.status === 'resolved').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Response Time:</span>
                      <span className="text-cyan-400">3.2 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default AdminDashboard; 