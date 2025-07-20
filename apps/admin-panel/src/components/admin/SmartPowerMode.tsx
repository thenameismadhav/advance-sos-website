import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Battery, 
  BatteryCharging, 
  BatteryFull, 
  BatteryLow, 
  BatteryMedium,
  Zap,
  Settings,
  Activity,
  Clock,
  MapPin,
  Mic,
  Video,
  Wifi,
  Signal,
  Power,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface PowerProfile {
  id: string;
  name: string;
  batteryThreshold: number;
  locationPollingRate: number; // seconds
  audioRecordingRate: number; // seconds
  videoRecordingRate: number; // seconds
  dataSyncRate: number; // seconds
  gpsAccuracy: 'high' | 'medium' | 'low';
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  backgroundTasks: boolean;
  realTimeSync: boolean;
  description: string;
}

interface DevicePowerStatus {
  batteryLevel: number;
  isCharging: boolean;
  estimatedTimeRemaining: number; // minutes
  powerMode: 'performance' | 'balanced' | 'power_save' | 'ultra_power_save';
  temperature: number;
  cpuUsage: number;
  memoryUsage: number;
  networkStrength: number;
  lastUpdate: Date;
}

interface PowerOptimization {
  locationPolling: {
    current: number;
    optimized: number;
    savings: number;
  };
  audioRecording: {
    current: number;
    optimized: number;
    savings: number;
  };
  dataSync: {
    current: number;
    optimized: number;
    savings: number;
  };
  estimatedBatteryLife: {
    current: number;
    optimized: number;
    improvement: number;
  };
}

export const SmartPowerMode: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<PowerProfile | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DevicePowerStatus>({
    batteryLevel: 85,
    isCharging: false,
    estimatedTimeRemaining: 420,
    powerMode: 'balanced',
    temperature: 35,
    cpuUsage: 45,
    memoryUsage: 60,
    networkStrength: 85,
    lastUpdate: new Date()
  });
  const [optimization, setOptimization] = useState<PowerOptimization>({
    locationPolling: { current: 30, optimized: 60, savings: 50 },
    audioRecording: { current: 10, optimized: 30, savings: 67 },
    dataSync: { current: 5, optimized: 15, savings: 67 },
    estimatedBatteryLife: { current: 7, optimized: 12, improvement: 71 }
  });

  const powerProfiles: PowerProfile[] = [
    {
      id: 'performance',
      name: 'Performance Mode',
      batteryThreshold: 100,
      locationPollingRate: 10,
      audioRecordingRate: 5,
      videoRecordingRate: 10,
      dataSyncRate: 2,
      gpsAccuracy: 'high',
      compressionLevel: 'none',
      backgroundTasks: true,
      realTimeSync: true,
      description: 'Maximum performance with real-time updates'
    },
    {
      id: 'balanced',
      name: 'Balanced Mode',
      batteryThreshold: 50,
      locationPollingRate: 30,
      audioRecordingRate: 15,
      videoRecordingRate: 30,
      dataSyncRate: 10,
      gpsAccuracy: 'medium',
      compressionLevel: 'low',
      backgroundTasks: true,
      realTimeSync: false,
      description: 'Balanced performance and battery life'
    },
    {
      id: 'power_save',
      name: 'Power Save Mode',
      batteryThreshold: 20,
      locationPollingRate: 60,
      audioRecordingRate: 30,
      videoRecordingRate: 60,
      dataSyncRate: 30,
      gpsAccuracy: 'low',
      compressionLevel: 'medium',
      backgroundTasks: false,
      realTimeSync: false,
      description: 'Optimized for battery life'
    },
    {
      id: 'ultra_power_save',
      name: 'Ultra Power Save',
      batteryThreshold: 10,
      locationPollingRate: 120,
      audioRecordingRate: 60,
      videoRecordingRate: 120,
      dataSyncRate: 60,
      gpsAccuracy: 'low',
      compressionLevel: 'high',
      backgroundTasks: false,
      realTimeSync: false,
      description: 'Emergency mode with minimal power usage'
    }
  ];

  // Simulate real-time device status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStatus(prev => ({
        ...prev,
        batteryLevel: Math.max(0, Math.min(100, prev.batteryLevel + (Math.random() - 0.5) * 2)),
        temperature: Math.max(20, Math.min(50, prev.temperature + (Math.random() - 0.5) * 2)),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkStrength: Math.max(0, Math.min(100, prev.networkStrength + (Math.random() - 0.5) * 5)),
        lastUpdate: new Date()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-optimize based on battery level
  useEffect(() => {
    if (!autoOptimize) return;

    let newProfile: PowerProfile;
    
    if (deviceStatus.batteryLevel >= 80) {
      newProfile = powerProfiles[0]; // Performance
    } else if (deviceStatus.batteryLevel >= 50) {
      newProfile = powerProfiles[1]; // Balanced
    } else if (deviceStatus.batteryLevel >= 20) {
      newProfile = powerProfiles[2]; // Power Save
    } else {
      newProfile = powerProfiles[3]; // Ultra Power Save
    }

    if (currentProfile?.id !== newProfile.id) {
      setCurrentProfile(newProfile);
      applyPowerProfile(newProfile);
    }
  }, [deviceStatus.batteryLevel, autoOptimize]);

  const applyPowerProfile = (profile: PowerProfile) => {
    // Simulate applying power profile
    console.log('Applying power profile:', profile.name);
    
    // Update optimization metrics
    setOptimization(prev => ({
      ...prev,
      locationPolling: { 
        current: profile.locationPollingRate, 
        optimized: profile.locationPollingRate, 
        savings: 0 
      },
      audioRecording: { 
        current: profile.audioRecordingRate, 
        optimized: profile.audioRecordingRate, 
        savings: 0 
      },
      dataSync: { 
        current: profile.dataSyncRate, 
        optimized: profile.dataSyncRate, 
        savings: 0 
      }
    }));
  };

  const handleManualProfileChange = (profileId: string) => {
    const profile = powerProfiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      applyPowerProfile(profile);
    }
  };

  const getBatteryIcon = (level: number, isCharging: boolean) => {
    if (isCharging) return <BatteryCharging className="h-6 w-6 text-green-500" />;
    if (level >= 80) return <BatteryFull className="h-6 w-6 text-green-500" />;
    if (level >= 50) return <BatteryMedium className="h-6 w-6 text-yellow-500" />;
    if (level >= 20) return <BatteryLow className="h-6 w-6 text-orange-500" />;
    return <Battery className="h-6 w-6 text-red-500" />;
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    if (level >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Power Mode Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <CardTitle>Smart Power Mode</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
                <span className="text-sm font-medium">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoOptimize}
                  onCheckedChange={setAutoOptimize}
                  disabled={!isEnabled}
                />
                <span className="text-sm">Auto Optimize</span>
              </div>
            </div>
          </div>
          <CardDescription>
            Dynamically adjust location polling and recording rates based on battery level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {powerProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentProfile?.id === profile.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleManualProfileChange(profile.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{profile.name}</h4>
                  <Badge variant={currentProfile?.id === profile.id ? 'default' : 'outline'}>
                    {profile.batteryThreshold}%+
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{profile.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>Location: {profile.locationPollingRate}s</div>
                  <div>Audio: {profile.audioRecordingRate}s</div>
                  <div>Sync: {profile.dataSyncRate}s</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Power Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Battery className="h-5 w-5" />
            <span>Device Power Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Battery Status */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getBatteryIcon(deviceStatus.batteryLevel, deviceStatus.isCharging)}
              </div>
              <div className={`text-2xl font-bold ${getBatteryColor(deviceStatus.batteryLevel)}`}>
                {deviceStatus.batteryLevel.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">
                {deviceStatus.isCharging ? 'Charging' : 'Discharging'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatTime(deviceStatus.estimatedTimeRemaining)} remaining
              </div>
            </div>

            {/* Temperature */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {deviceStatus.temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-gray-500">Temperature</div>
              <div className="text-xs text-gray-400 mt-1">
                {deviceStatus.temperature > 40 ? 'High' : deviceStatus.temperature > 35 ? 'Normal' : 'Low'}
              </div>
            </div>

            {/* CPU Usage */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {deviceStatus.cpuUsage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">CPU Usage</div>
              <Progress value={deviceStatus.cpuUsage} className="mt-2 h-2" />
            </div>

            {/* Memory Usage */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {deviceStatus.memoryUsage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Memory Usage</div>
              <Progress value={deviceStatus.memoryUsage} className="mt-2 h-2" />
            </div>
          </div>

          {/* Network Status */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Network Strength</span>
              <span className="text-sm text-gray-500">{deviceStatus.networkStrength}%</span>
            </div>
            <Progress value={deviceStatus.networkStrength} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Power Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Power Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Location Polling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location Polling</span>
                </div>
                <Badge variant="outline">
                  {optimization.locationPolling.optimized}s interval
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-600">
                    {optimization.locationPolling.current}s
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {optimization.locationPolling.optimized}s
                  </div>
                  <div className="text-xs text-gray-500">Optimized</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {optimization.locationPolling.savings}%
                  </div>
                  <div className="text-xs text-gray-500">Savings</div>
                </div>
              </div>
            </div>

            {/* Audio Recording */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span className="font-medium">Audio Recording</span>
                </div>
                <Badge variant="outline">
                  {optimization.audioRecording.optimized}s interval
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-600">
                    {optimization.audioRecording.current}s
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {optimization.audioRecording.optimized}s
                  </div>
                  <div className="text-xs text-gray-500">Optimized</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {optimization.audioRecording.savings}%
                  </div>
                  <div className="text-xs text-gray-500">Savings</div>
                </div>
              </div>
            </div>

            {/* Data Sync */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <span className="font-medium">Data Sync</span>
                </div>
                <Badge variant="outline">
                  {optimization.dataSync.optimized}s interval
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-600">
                    {optimization.dataSync.current}s
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {optimization.dataSync.optimized}s
                  </div>
                  <div className="text-xs text-gray-500">Optimized</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {optimization.dataSync.savings}%
                  </div>
                  <div className="text-xs text-gray-500">Savings</div>
                </div>
              </div>
            </div>

            {/* Battery Life Improvement */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Estimated Battery Life</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  +{optimization.estimatedBatteryLife.improvement}% improvement
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-600">
                    {optimization.estimatedBatteryLife.current}h
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {optimization.estimatedBatteryLife.optimized}h
                  </div>
                  <div className="text-xs text-gray-500">Optimized</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 