import React, { useState, useEffect } from 'react';
import { AdvancedMap } from './AdvancedMap';
import { ZoneManagementPanel } from '@/components/admin/ZoneManagementPanel';
import { EmergencyZoneStatsPanel } from '@/components/admin/EmergencyZoneStatsPanel';
import { MapMarker } from '@/types/sos';
import { Zone, GeoSweep } from '@/types/geospatial';
import { 
  Layers, 
  Settings, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Building2,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedAdminMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarker?: MapMarker | null;
  className?: string;
}

export const EnhancedAdminMap: React.FC<EnhancedAdminMapProps> = ({
  markers,
  onMarkerClick,
  selectedMarker,
  className = '',
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSweep, setSelectedSweep] = useState<GeoSweep | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false); // Changed to false by default
  const [activeTab, setActiveTab] = useState('map');
  const [mapFilters, setMapFilters] = useState({
    showGeoSweep: true,
    showZones: true,
    showClusters: true,
    showRoutes: true,
    showIsochrones: true,
  });

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setActiveTab('stats');
  };

  const handleSweepSelect = (sweep: GeoSweep) => {
    setSelectedSweep(sweep);
  };

  const handleZoneUpdate = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleZoneDelete = (zoneId: string) => {
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    }
  };

  // Trigger map resize when side panel state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [showSidePanel]);

  // Add resize observer to handle container size changes
  useEffect(() => {
    const container = document.querySelector('.map-container');
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Main Map Area */}
      <div className={`flex-1 relative ${showSidePanel ? 'mr-4' : ''}`}>
        <AdvancedMap
          markers={markers}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
          showGeoSweep={mapFilters.showGeoSweep}
          showZones={mapFilters.showZones}
          showClusters={mapFilters.showClusters}
          showRoutes={mapFilters.showRoutes}
          showIsochrones={mapFilters.showIsochrones}
          onZoneSelect={handleZoneSelect}
          onSweepSelect={handleSweepSelect}
        />

        {/* Toggle Side Panel Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowSidePanel(!showSidePanel)}
          className="absolute top-4 right-4 z-20 bg-black/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400/20"
        >
          {showSidePanel ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Side Panel */}
      {showSidePanel && (
        <div className="w-80 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map" className="text-xs">Map</TabsTrigger>
              <TabsTrigger value="zones" className="text-xs">Zones</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-4">
              {/* Map Info Panel */}
              <Card className="bg-black/80 border-cyan-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cyan-300">Map Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total Markers:</span>
                    <span className="text-white">{markers.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">SOS Events:</span>
                    <span className="text-red-400">{markers.filter(m => m.type === 'sos').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Helpers:</span>
                    <span className="text-green-400">{markers.filter(m => m.type === 'helper').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Responders:</span>
                    <span className="text-blue-400">{markers.filter(m => m.type === 'responder').length}</span>
                  </div>
                  {selectedMarker && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Selected:</div>
                      <div className="text-xs text-white">{selectedMarker.name}</div>
                      <div className="text-xs text-gray-500">{selectedMarker.type}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* GeoSweep Info */}
              {selectedSweep && (
                <Card className="bg-black/80 border-cyan-400">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-cyan-300">GeoSweep Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Zone:</span>
                      <span className="text-white">{selectedSweep.zoneName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Radius:</span>
                      <span className="text-white">{selectedSweep.radius}m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Responders:</span>
                      <span className="text-blue-400">{selectedSweep.respondersCount || 0}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSweep(null)}
                      className="w-full text-xs text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear Sweep
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="zones">
              <ZoneManagementPanel
                onZoneSelect={handleZoneSelect}
                onZoneUpdate={handleZoneUpdate}
                onZoneDelete={handleZoneDelete}
              />
            </TabsContent>

            <TabsContent value="stats">
              <EmergencyZoneStatsPanel
                selectedZone={selectedZone}
                autoRefresh={true}
                refreshInterval={15}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}; 