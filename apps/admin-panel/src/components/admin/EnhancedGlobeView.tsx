import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  X, 
  Layers, 
  Eye, 
  EyeOff, 
  Settings, 
  Activity,
  AlertTriangle,
  MapPin,
  Users,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Filter,
  TrendingUp
} from 'lucide-react';
import { 
  Viewer, 
  Color, 
  Entity,
  PointGraphics,
  LabelGraphics,
  Cartesian3,
  HeightReference,
  VerticalOrigin,
  HorizontalOrigin,
  CallbackProperty,
  Clock,
  ClockRange,
  ClockStep
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface AlertData {
  id: string;
  latitude: number;
  longitude: number;
  type: 'medical' | 'fire' | 'police' | 'traffic' | 'natural_disaster';
  priority: 'low' | 'medium' | 'high' | 'critical';
  intensity: number; // 0-100 for heatmap
  timestamp: Date;
  description: string;
  status: 'active' | 'resolved' | 'pending';
}

interface GlobeViewProps {
  isVisible: boolean;
  onClose: () => void;
  alerts?: AlertData[];
}

interface GlobeControls {
  showHeatmap: boolean;
  showAlerts: boolean;
  showUsers: boolean;
  showBuildings: boolean;
  showTerrain: boolean;
  autoRotate: boolean;
  showLabels: boolean;
  showTrajectories: boolean;
}

const EnhancedGlobeView: React.FC<GlobeViewProps> = ({ isVisible, onClose, alerts = [] }) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [controls, setControls] = useState<GlobeControls>({
    showHeatmap: true,
    showAlerts: true,
    showUsers: true,
    showBuildings: false,
    showTerrain: true,
    autoRotate: false,
    showLabels: true,
    showTrajectories: false
  });

  // Initialize Cesium viewer
  useEffect(() => {
    const initializeViewer = async () => {
      if (isVisible && cesiumContainerRef.current && !viewerRef.current) {
        setIsLoading(true);

        try {
          // Set your Cesium ion access token here
          // Ion.defaultAccessToken = 'your-cesium-ion-access-token';

          const viewer = new Viewer(cesiumContainerRef.current, {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            skyAtmosphere: false,
            scene3DOnly: true,
            shouldAnimate: true
          });

          // Configure scene
          viewer.scene.backgroundColor = Color.BLACK;
          viewer.scene.globe.enableLighting = false;
          viewer.scene.globe.showGroundAtmosphere = false;

          // Set up clock for animations
          viewer.clock.clockRange = ClockRange.LOOP_STOP;
          viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
          viewer.clock.multiplier = 1.0;

          viewerRef.current = viewer;
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to initialize Cesium viewer:', error);
          setIsLoading(false);
        }
      }
    };

    initializeViewer();

    // Clean up on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isVisible, controls.showBuildings]);

  // Add alerts to the globe
  useEffect(() => {
    if (!viewerRef.current || !controls.showAlerts) return;

    const viewer = viewerRef.current;
    
    // Clear existing entities
    viewer.entities.removeAll();

    // Add alert entities
    alerts.forEach(alert => {
      const position = Cartesian3.fromDegrees(alert.longitude, alert.latitude);
      
      // Create entity with point graphics
      const entity = viewer.entities.add({
        position: position,
        point: new PointGraphics({
          pixelSize: 15,
          color: getAlertColor(alert.type, alert.priority),
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          scaleByDistance: {
            near: 1000,
            nearValue: 1.0,
            far: 10000000,
            farValue: 0.5
          }
        }),
        label: controls.showLabels ? new LabelGraphics({
          text: alert.description,
          font: '12pt sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: 1,
          pixelOffset: new Cartesian3(0, -30),
          heightReference: HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER
        }) : undefined
      });

      // Add pulsing animation for critical alerts
      if (alert.priority === 'critical') {
        entity.point!.color = new CallbackProperty(() => {
          const time = Date.now() * 0.001;
          const alpha = 0.5 + 0.5 * Math.sin(time * 3);
          return Color.RED.withAlpha(alpha);
        }, false);
      }
    });
  }, [alerts, controls.showAlerts, controls.showLabels]);

  // Add heatmap layer
  useEffect(() => {
    if (!viewerRef.current || !controls.showHeatmap) return;

    const viewer = viewerRef.current;
    
    // Create heatmap data
    const heatmapData = alerts.map(alert => ({
      x: alert.longitude,
      y: alert.latitude,
      value: alert.intensity
    }));

    // Add heatmap visualization using billboards or custom shaders
    // This is a simplified version - in production you'd use a proper heatmap library
    heatmapData.forEach(point => {
      const position = Cartesian3.fromDegrees(point.x, point.y);
      const intensity = point.value / 100;
      
      viewer.entities.add({
        position: position,
        point: new PointGraphics({
          pixelSize: 50 * intensity,
          color: Color.RED.withAlpha(intensity * 0.3),
          heightReference: HeightReference.CLAMP_TO_GROUND
        })
      });
    });
  }, [alerts, controls.showHeatmap]);

  // Auto-rotation
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    
    if (controls.autoRotate) {
      viewer.scene.camera.rotate(Cartesian3.UNIT_Z, 0.001);
    }
  }, [controls.autoRotate]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAlertColor = (type: string, priority: string) => {
    const colors = {
      medical: { low: Color.BLUE, medium: Color.YELLOW, high: Color.ORANGE, critical: Color.RED },
      fire: { low: Color.ORANGE, medium: Color.RED, high: Color.DARKRED, critical: Color.BLACK },
      police: { low: Color.BLUE, medium: Color.PURPLE, high: Color.DARKBLUE, critical: Color.BLACK },
      traffic: { low: Color.YELLOW, medium: Color.ORANGE, high: Color.RED, critical: Color.DARKRED },
      natural_disaster: { low: Color.GREEN, medium: Color.YELLOW, high: Color.ORANGE, critical: Color.RED }
    };
    
    return colors[type as keyof typeof colors]?.[priority as keyof typeof colors.medical] || Color.WHITE;
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(0, 0, 20000000),
        orientation: {
          heading: 0,
          pitch: -Math.PI / 2,
          roll: 0
        }
      });
    }
  };

  const handleToggleControl = (control: keyof GlobeControls) => {
    setControls(prev => ({ ...prev, [control]: !prev[control] }));
  };

  if (!isVisible) return null;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Globe container */}
      <div 
        ref={cesiumContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute top-4 left-4 space-y-4">
          {/* Main controls */}
          <Card className="w-80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>3D Globe Controls</span>
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowControls(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Layer controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Heatmap</span>
                  <Switch
                    checked={controls.showHeatmap}
                    onCheckedChange={() => handleToggleControl('showHeatmap')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Alerts</span>
                  <Switch
                    checked={controls.showAlerts}
                    onCheckedChange={() => handleToggleControl('showAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Labels</span>
                  <Switch
                    checked={controls.showLabels}
                    onCheckedChange={() => handleToggleControl('showLabels')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Rotate</span>
                  <Switch
                    checked={controls.autoRotate}
                    onCheckedChange={() => handleToggleControl('autoRotate')}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetView}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleFullscreen}
                  className="flex-1"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats card */}
          <Card className="w-80">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => a.priority === 'critical').length}
                  </div>
                  <div className="text-xs text-gray-500">Critical</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {alerts.filter(a => a.priority === 'high').length}
                  </div>
                  <div className="text-xs text-gray-500">High</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => a.priority === 'medium').length}
                  </div>
                  <div className="text-xs text-gray-500">Medium</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.priority === 'low').length}
                  </div>
                  <div className="text-xs text-gray-500">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Close button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-red-500/20 hover:bg-red-500/30 text-red-300"
      >
        <X className="h-4 w-4 mr-2" />
        Return to Map
      </Button>

      {/* Show controls button */}
      {!showControls && (
        <Button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 z-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
        >
          <Settings className="h-4 w-4 mr-2" />
          Controls
        </Button>
      )}
    </div>
  );
};

export default EnhancedGlobeView; 