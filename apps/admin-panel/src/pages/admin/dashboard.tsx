import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedAdminMap } from '@/components/map/EnhancedAdminMap';
import { AICopilotPanel } from '@/components/admin/AICopilotPanel';
import { GlobalOpsMode } from '@/components/admin/GlobalOpsMode';
import { EncryptionPanel } from '@/components/admin/EncryptionPanel';
import { LiveCamMode } from '@/components/admin/LiveCamMode';
import SimpleGlobeView from '@/components/admin/SimpleGlobeView';
import { SmartPowerMode } from '@/components/admin/SmartPowerMode';
import { APIService } from '@/lib/services/api';
import { RealtimeService } from '@/lib/services/realtime';
import { SOSEvent, Helper, Responder, Hospital, MapMarker } from '@/types/sos';
import { MapFilters } from '@/types/map';
import { formatRelativeTime, getEmergencyTypeColor, getStatusColor } from '@/lib/utils';
import { 
  MapPin, 
  Users, 
  User, 
  AlertTriangle, 
  Globe, 
  Layers, 
  Keyboard, 
  Activity, 
  Clock, 
  Phone, 
  Star, 
  ChevronDown, 
  Filter, 
  Shield, 
  Zap, 
  Settings, 
  Database, 
  BarChart3, 
  Bell,
  Brain,
  Video,
  Battery,
  Lock,
  Server,
  X,
  Radio,
  MessageSquare,
  Eye,
  FileText,
  Monitor
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard: React.FC = () => {
  const [sosEvents, setSosEvents] = useState<SOSEvent[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedSOSEvent, setSelectedSOSEvent] = useState<SOSEvent | null>(null);
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
  
  // Debug logging for dropdown state
  useEffect(() => {
    console.log('Dropdown state changed:', isFiltersOpen);
    // Force a re-render when dropdown state changes
    if (isFiltersOpen) {
      setTimeout(() => {
        console.log('Dropdown should be visible now');
      }, 100);
    }
  }, [isFiltersOpen]);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isMapPanelsOpen, setIsMapPanelsOpen] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [geoSweepRadius, setGeoSweepRadius] = useState(5000);
  const [selectedZoneType, setSelectedZoneType] = useState('circle');
  const [mapStyle, setMapStyle] = useState('satellite');
  
  // New feature states
  const [activeTab, setActiveTab] = useState('overview');
  const [alertsForGlobe, setAlertsForGlobe] = useState<any[]>([]);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showPowerModeModal, setShowPowerModeModal] = useState(false);

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
      
      // Check if click is outside the filters dropdown
      const filtersDropdown = document.querySelector('.filters-dropdown');
      if (filtersDropdown && !filtersDropdown.contains(target)) {
        setIsFiltersOpen(false);
      }
      
      // Check if click is outside the system status dropdown
      const systemStatusDropdown = document.querySelector('.system-status-dropdown');
      if (systemStatusDropdown && !systemStatusDropdown.contains(target)) {
        setIsSystemStatusOpen(false);
      }
    };

    // Use mousedown instead of click for better responsiveness
    document.addEventListener('mousedown', handleClickOutside);
    
    // Also close on escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersOpen(false);
        setIsSystemStatusOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
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
        
        // Convert SOS events to globe alerts
        const globeAlerts = eventsRes.events.map(event => ({
          id: event.id,
          latitude: event.latitude,
          longitude: event.longitude,
          type: event.emergency_type,
          priority: event.priority,
          intensity: event.priority === 'critical' ? 100 : event.priority === 'high' ? 75 : event.priority === 'medium' ? 50 : 25,
          timestamp: new Date(event.created_at),
          description: event.description || 'Emergency Alert',
          status: event.status
        }));
        setAlertsForGlobe(globeAlerts);
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
        
        // Update globe alerts
        const newAlert = {
          id: payload.new.id,
          latitude: payload.new.latitude,
          longitude: payload.new.longitude,
          type: payload.new.emergency_type,
          priority: payload.new.priority,
          intensity: payload.new.priority === 'critical' ? 100 : payload.new.priority === 'high' ? 75 : payload.new.priority === 'medium' ? 50 : 25,
          timestamp: new Date(payload.new.created_at),
          description: payload.new.description || 'Emergency Alert',
          status: payload.new.status
        };
        
        setAlertsForGlobe(prev => {
          const index = prev.findIndex(a => a.id === newAlert.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newAlert;
            return updated;
          } else {
            return [newAlert, ...prev];
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
      }
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
              action: () => {
                setSelectedSOSEvent(event);
                setActiveTab('ai-copilot');
              },
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

    setMarkers(newMarkers);
  }, [sosEvents, helpers, responders]);

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
    if (marker.type === 'sos') {
      setSelectedSOSEvent(marker.data as SOSEvent);
    }
  };

  const handleAssignHelper = (helperId: string) => {
    console.log('Assigning helper:', helperId, 'to SOS event:', selectedSOSEvent?.id);
  };

  const handleAssignResponder = (responderId: string) => {
    console.log('Assigning responder:', responderId, 'to SOS event:', selectedSOSEvent?.id);
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
    <div className="min-h-screen bg-black font-mono text-white admin-dashboard">
        {/* Fixed Header Bar */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-black/95 border-b border-cyan-400/50 z-50 shadow-[0_0_8px_#00fff7]">
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-cyan-300">SOS HQ</span>
                <div className="w-1 h-5 bg-cyan-400 rounded-full"></div>
              </div>
            
            {/* Navigation Dropdown */}
            <div className="relative filters-dropdown">
                {/* Debug info */}
                {isFiltersOpen && (
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded z-[999999]">
                    Dropdown is open! State: {isFiltersOpen.toString()}
                  </div>
                )}
              <Button
                size="sm"
                variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                  console.log('Dropdown button clicked, current state:', isFiltersOpen);
                  setIsFiltersOpen(!isFiltersOpen);
                }}
                  className="bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30 transition-all duration-200 text-sm"
              >
                  <Layers className="w-3 h-3 mr-1" />
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'ai-copilot' && 'AI Copilot'}
                {activeTab === 'live-cam' && 'Live Cam'}
                {activeTab === 'global-ops' && 'Global Ops'}
                {activeTab === '3d-globe' && '3D Globe'}
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Dropdown Menu */}
              {isFiltersOpen && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-black/95 border border-cyan-400/50 rounded-lg shadow-2xl backdrop-blur-sm"
                    style={{ 
                      position: 'absolute',
                      zIndex: 999999,
                      pointerEvents: 'auto',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1
                    }}
                  >
                  <div className="py-1">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                        console.log('Overview clicked');
                        setActiveTab('overview');
                        setIsFiltersOpen(false);
                      }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-cyan-500/20 transition-colors duration-200 ${
                        activeTab === 'overview' ? 'text-cyan-300 bg-cyan-500/10' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
                          <span className="font-medium">Overview</span>
                      </div>
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('AI Copilot clicked');
                        setActiveTab('ai-copilot');
                        setIsFiltersOpen(false);
                      }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-500/20 transition-colors duration-200 ${
                        activeTab === 'ai-copilot' ? 'text-purple-300 bg-purple-500/10' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                          <Brain className="w-3 h-3 mr-2 text-purple-400" />
                          <span className="font-medium">AI Copilot</span>
                      </div>
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Live Cam clicked');
                        setActiveTab('live-cam');
                        setIsFiltersOpen(false);
                      }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 transition-colors duration-200 ${
                        activeTab === 'live-cam' ? 'text-red-300 bg-red-500/10' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                          <Video className="w-3 h-3 mr-2 text-red-400" />
                          <span className="font-medium">Live Cam</span>
                      </div>
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Global Ops clicked');
                        setActiveTab('global-ops');
                        setIsFiltersOpen(false);
                      }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-500/20 transition-colors duration-200 ${
                        activeTab === 'global-ops' ? 'text-blue-300 bg-blue-500/10' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                          <Server className="w-3 h-3 mr-2 text-blue-400" />
                          <span className="font-medium">Global Ops</span>
                      </div>
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('3D Globe clicked');
                        setActiveTab('3d-globe');
                        setIsFiltersOpen(false);
                      }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-500/20 transition-colors duration-200 ${
                        activeTab === '3d-globe' ? 'text-indigo-300 bg-indigo-500/10' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                          <Globe className="w-3 h-3 mr-2 text-indigo-400" />
                          <span className="font-medium">3D Globe</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
            {/* Center: Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">STATUS: OPERATIONAL</span>
                </div>
                <div className="w-px h-5 bg-cyan-400/30"></div>
                <span className="text-green-400 font-medium">POWER: STABLE</span>
                <div className="w-px h-5 bg-cyan-400/30"></div>
                <span className="text-green-400 font-medium">SECURITY: SECURE</span>
              </div>
            </div>
            
            {/* Right: Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowEncryptionModal(true);
                }}
                className="bg-green-500/20 text-green-300 border-green-400 hover:bg-green-500/30 transition-all duration-200 text-sm"
              >
                <Lock className="w-3 h-3 mr-1" />
                Encryption
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowPowerModeModal(true);
                }}
                className="bg-yellow-500/20 text-yellow-300 border-yellow-400 hover:bg-yellow-500/30 transition-all duration-200 text-sm"
              >
                <Battery className="w-3 h-3 mr-1" />
                Power Mode
              </Button>
                  </div>
                      </div>
        </header>

        {/* Main Content Area - Below Fixed Header */}
        <main className="pt-14 h-screen bg-black">
          <div className="grid grid-cols-12 gap-4 h-full p-4">
          {/* Left Sidebar - 2 columns */}
          <div className="col-span-2 flex flex-col space-y-4 h-full">
            
            {/* HELPERS & RESPONDERS Panel */}
            <Card className="bg-black/50 border-cyan-400/50 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-300 text-sm font-medium">HELPERS & RESPONDERS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-cyan-400" />
                    Vadodara, India
                  </div>
                  <div className="ml-4 text-xs text-gray-500">
                    <div>22.3321, 73.1586</div>
                    <div>Accuracy: ±5000m</div>
                    <div>Updated: {currentTime.toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <div className="font-medium mb-1">ACTIVE RESPONDERS</div>
                    <div className="text-gray-500">No active responders</div>
                </div>

                  <div className="text-xs text-gray-400">
                    <div className="font-medium mb-1">ALL HELPERS</div>
                    <div className="text-gray-500">{helpers.length} available</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COMMAND & CONTROL Panel */}
            <Card className="bg-black/50 border-cyan-400/50 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-300 text-sm font-medium">COMMAND & CONTROL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('ai-copilot')}
                  className="w-full bg-purple-500/20 text-purple-300 border-purple-400 hover:bg-purple-500/30 text-sm py-2"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  AI Command Center
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area - 8 columns */}
          <div className="col-span-8 overflow-hidden">
            <div className="w-full h-full">
              {activeTab === 'overview' && (
                <div className="h-full">
                  {/* Map Panel */}
                  <Card className="bg-black/50 border-cyan-400/50 h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-cyan-300 text-base font-medium">GEO-SPATIAL VIEW</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-60px)] overflow-hidden">
                      {/* Map Controls */}
                      <div className="flex gap-3 mb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30 text-sm"
                        >
                          SOS MAP
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-500/20 text-gray-300 border-gray-400 hover:bg-gray-500/30 text-sm"
                        >
                          LOCATION MANAGER
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-500/20 text-gray-300 border-gray-400 hover:bg-gray-500/30 text-sm"
                        >
                          SUPABASE MAP
                        </Button>
                      </div>
                      
                      {/* Map Display */}
                      <div className="h-[calc(100%-50px)] relative overflow-hidden rounded-lg border border-cyan-400/20">
                        <EnhancedAdminMap
                          markers={markers}
                          filters={mapFilters}
                          onMarkerClick={handleMarkerClick}
                          mapRef={mapRef}
                          setMapRef={setMapRef}
                          mapStyle={mapStyle}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'ai-copilot' && (
                <div className="h-full overflow-hidden">
                  <AICopilotPanel
                    currentSOSEvent={selectedSOSEvent}
                    onAssignHelper={handleAssignHelper}
                    onAssignResponder={handleAssignResponder}
                  />
                </div>
              )}

              {activeTab === 'live-cam' && (
                <div className="h-full overflow-hidden">
                  <LiveCamMode />
                </div>
              )}

              {activeTab === 'global-ops' && (
                <div className="h-full overflow-hidden">
                  <GlobalOpsMode />
                </div>
              )}

              {activeTab === '3d-globe' && (
                <div className="h-full overflow-hidden">
                  <SimpleGlobeView
                    isVisible={true}
                    onClose={() => setActiveTab('overview')}
                    alerts={alertsForGlobe}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - 2 columns */}
          <div className="col-span-2 flex flex-col space-y-4 h-full">
            
            {/* USER & VICTIM DETAILS Panel */}
            <Card className="bg-black/50 border-cyan-400/50 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-300 text-sm font-medium">USER & VICTIM DETAILS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Emergency Statistics */}
                  <div className="text-center">
                  <div className="text-xl font-bold text-red-500 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    0 Active
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Total SOS Events: 0</div>
                  <div className="text-xs text-gray-400">Critical Cases: 0</div>
                </div>

                {/* Active Emergencies */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <div className="font-medium mb-1">ACTIVE EMERGENCIES</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      No active emergencies
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LIVE SOS FEED Panel */}
            <Card className="bg-black/50 border-cyan-400/50 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-300 text-sm font-medium">LIVE SOS FEED</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-6 text-gray-500">
                  <div className="text-sm flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    No SOS events
                  </div>
                </div>
                
                {/* Feed Statistics */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <div className="font-medium mb-1">FEED STATISTICS</div>
                    <div className="text-gray-500">Total Events Today: 0</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

            {/* Encryption Modal */}
        {showEncryptionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black/95 border border-green-400/50 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-300">Encryption Panel</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEncryptionModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                </div>
              <EncryptionPanel />
                      </div>
                      </div>
        )}

        {/* Power Mode Modal */}
        {showPowerModeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black/95 border border-yellow-400/50 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-300">Power Mode Panel</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPowerModeModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                    </div>
              <SmartPowerMode />
                    </div>
                    </div>
        )}
      </div>
  );
};

export default AdminDashboard; 