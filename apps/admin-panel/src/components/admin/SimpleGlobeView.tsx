import React, { useState, useEffect, useRef } from 'react';
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

interface AlertData {
  id: string;
  latitude: number;
  longitude: number;
  type: 'medical' | 'fire' | 'police' | 'traffic' | 'natural_disaster';
  priority: 'low' | 'medium' | 'high' | 'critical';
  intensity: number;
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

const SimpleGlobeView: React.FC<GlobeViewProps> = ({ isVisible, onClose, alerts = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rotation, setRotation] = useState(0);
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

  // Initialize canvas
  useEffect(() => {
    if (isVisible && canvasRef.current) {
      setIsLoading(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size
        const resizeCanvas = () => {
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * window.devicePixelRatio;
          canvas.height = rect.height * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Start rendering
        const render = () => {
          drawGlobe(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
          requestAnimationFrame(render);
        };
        render();
        
        setIsLoading(false);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [isVisible]);

  // Auto-rotation
  useEffect(() => {
    if (!controls.autoRotate) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.5);
    }, 50);
    
    return () => clearInterval(interval);
  }, [controls.autoRotate]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const drawGlobe = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Draw globe outline
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = centerY + (lat / 90) * radius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.sqrt(radius * radius - (y - centerY) * (y - centerY)), 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
      const angle = (lon + rotation) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    // Draw alerts
    if (controls.showAlerts) {
      alerts.forEach(alert => {
        const lat = alert.latitude;
        const lon = alert.longitude;
        
        // Convert lat/lon to screen coordinates
        const latRad = lat * Math.PI / 180;
        const lonRad = (lon + rotation) * Math.PI / 180;
        
        const x = centerX + radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = centerY - radius * Math.sin(latRad);
        
        // Draw alert point
        const color = getAlertColor(alert.type, alert.priority);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        if (controls.showLabels) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(alert.description, x, y - 15);
        }
      });
    }
    
    // Draw heatmap
    if (controls.showHeatmap) {
      alerts.forEach(alert => {
        const lat = alert.latitude;
        const lon = alert.longitude;
        
        const latRad = lat * Math.PI / 180;
        const lonRad = (lon + rotation) * Math.PI / 180;
        
        const x = centerX + radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = centerY - radius * Math.sin(latRad);
        
        const intensity = alert.intensity / 100;
        ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 30 * intensity, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    const colors = {
      medical: { low: '#0000ff', medium: '#ffff00', high: '#ffa500', critical: '#ff0000' },
      fire: { low: '#ffa500', medium: '#ff0000', high: '#8b0000', critical: '#000000' },
      police: { low: '#0000ff', medium: '#800080', high: '#00008b', critical: '#000000' },
      traffic: { low: '#ffff00', medium: '#ffa500', high: '#ff0000', critical: '#8b0000' },
      natural_disaster: { low: '#008000', medium: '#ffff00', high: '#ffa500', critical: '#ff0000' }
    };
    
    return colors[type as keyof typeof colors]?.[priority as keyof typeof colors.medical] || '#ffffff';
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleResetView = () => {
    setRotation(0);
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

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-4 left-4 z-20">
          <Card className="w-80 bg-gray-800/90 border-gray-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">3D Globe Controls</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={controls.showHeatmap}
                    onCheckedChange={() => handleToggleControl('showHeatmap')}
                  />
                  <span className="text-sm text-white">Heatmap</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={controls.showAlerts}
                    onCheckedChange={() => handleToggleControl('showAlerts')}
                  />
                  <span className="text-sm text-white">Alerts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={controls.showLabels}
                    onCheckedChange={() => handleToggleControl('showLabels')}
                  />
                  <span className="text-sm text-white">Labels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={controls.autoRotate}
                    onCheckedChange={() => handleToggleControl('autoRotate')}
                  />
                  <span className="text-sm text-white">Auto Rotate</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetView}
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFullscreen}
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Summary */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-gray-800/90 border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Badge variant="destructive" className="mb-1">0 Critical</Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-1 bg-orange-500">0 High</Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-1 bg-yellow-500">0 Medium</Badge>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-1 bg-green-500">0 Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black"
        style={{ cursor: 'grab' }}
      />

      {/* Close button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-20"
      >
        <X className="h-4 w-4 mr-2" />
        Return to Map
      </Button>

      {/* Show controls button */}
      {!showControls && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 z-20 text-white border-gray-600 hover:bg-gray-700"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SimpleGlobeView; 