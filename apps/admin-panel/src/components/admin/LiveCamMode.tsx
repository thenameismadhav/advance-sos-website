import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Phone, 
  PhoneOff,
  Circle,
  Square,
  Download,
  Share,
  Settings,
  Fullscreen,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface LiveStream {
  id: string;
  userId: string;
  userName: string;
  status: 'connecting' | 'live' | 'disconnected' | 'error';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  bitrate: number;
  resolution: string;
  fps: number;
  audioLevel: number;
  videoLevel: number;
  startTime: Date;
  duration: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  emergencyType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface StreamControls {
  video: boolean;
  audio: boolean;
  recording: boolean;
  fullscreen: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export const LiveCamMode: React.FC = () => {
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [streamControls, setStreamControls] = useState<StreamControls>({
    video: true,
    audio: true,
    recording: false,
    fullscreen: false,
    quality: 'high'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);
  const [maxStreams, setMaxStreams] = useState(4);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulate live streams
  useEffect(() => {
    const streams: LiveStream[] = [
      {
        id: '1',
        userId: 'user-001',
        userName: 'John Doe',
        status: 'live',
        quality: 'high',
        bitrate: 2500,
        resolution: '1920x1080',
        fps: 30,
        audioLevel: 75,
        videoLevel: 85,
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        duration: 300,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'New York, NY'
        },
        emergencyType: 'Medical Emergency',
        priority: 'high'
      },
      {
        id: '2',
        userId: 'user-002',
        userName: 'Jane Smith',
        status: 'connecting',
        quality: 'medium',
        bitrate: 1500,
        resolution: '1280x720',
        fps: 25,
        audioLevel: 60,
        videoLevel: 70,
        startTime: new Date(Date.now() - 120000), // 2 minutes ago
        duration: 120,
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          address: 'Los Angeles, CA'
        },
        emergencyType: 'Fire Emergency',
        priority: 'critical'
      },
      {
        id: '3',
        userId: 'user-003',
        userName: 'Mike Johnson',
        status: 'live',
        quality: 'ultra',
        bitrate: 4000,
        resolution: '2560x1440',
        fps: 60,
        audioLevel: 90,
        videoLevel: 95,
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        duration: 600,
        location: {
          latitude: 41.8781,
          longitude: -87.6298,
          address: 'Chicago, IL'
        },
        emergencyType: 'Traffic Accident',
        priority: 'medium'
      }
    ];

    setActiveStreams(streams);
    if (streams.length > 0) {
      setSelectedStream(streams[0]);
    }
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStreams(prev => 
        prev.map(stream => ({
          ...stream,
          duration: stream.duration + 1,
          audioLevel: Math.max(0, Math.min(100, stream.audioLevel + (Math.random() - 0.5) * 10)),
          videoLevel: Math.max(0, Math.min(100, stream.videoLevel + (Math.random() - 0.5) * 5)),
          bitrate: stream.bitrate + (Math.random() - 0.5) * 100
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStreamSelect = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  const handleToggleVideo = () => {
    setStreamControls(prev => ({ ...prev, video: !prev.video }));
  };

  const handleToggleAudio = () => {
    setStreamControls(prev => ({ ...prev, audio: !prev.audio }));
  };

  const handleToggleRecording = () => {
    setStreamControls(prev => ({ ...prev, recording: !prev.recording }));
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setStreamControls(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high' | 'ultra') => {
    setStreamControls(prev => ({ ...prev, quality }));
  };

  const handleDownloadRecording = () => {
    // Simulate download
    console.log('Downloading recording...');
  };

  const handleShareStream = () => {
    // Simulate sharing
    console.log('Sharing stream...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting': return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Live Cam Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-red-600" />
              <CardTitle>Live Cam Mode</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRecord}
                  onCheckedChange={setAutoRecord}
                />
                <span className="text-sm">Auto Record</span>
              </div>
              <Badge variant="destructive">
                {activeStreams.filter(s => s.status === 'live').length} Active
              </Badge>
            </div>
          </div>
          <CardDescription>
            Stream user video to admin panel in emergency situations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {activeStreams.filter(s => s.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {activeStreams.filter(s => s.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {activeStreams.filter(s => s.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activeStreams.filter(s => s.priority === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Video Player */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <CardTitle>
                  {selectedStream ? `${selectedStream.userName} - ${selectedStream.emergencyType}` : 'No Stream Selected'}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowControls(!showControls)}
                >
                  {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                {selectedStream ? (
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold">{selectedStream.userName}</p>
                    <p className="text-sm text-gray-400">{selectedStream.emergencyType}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedStream.location.address}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Select a stream to view</p>
                  </div>
                )}
              </div>

              {/* Stream Controls Overlay */}
              {showControls && selectedStream && (
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant={streamControls.video ? "default" : "secondary"}
                        onClick={handleToggleVideo}
                      >
                        {streamControls.video ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={streamControls.audio ? "default" : "secondary"}
                        onClick={handleToggleAudio}
                      >
                        {streamControls.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={streamControls.recording ? "destructive" : "secondary"}
                        onClick={handleToggleRecording}
                      >
                        {streamControls.recording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">
                        {formatDuration(selectedStream.duration)}
                      </span>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            {selectedStream && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Quality</div>
                  <div className="text-lg font-semibold capitalize">{selectedStream.quality}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Bitrate</div>
                  <div className="text-lg font-semibold">{selectedStream.bitrate.toFixed(0)} kbps</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">Resolution</div>
                  <div className="text-lg font-semibold">{selectedStream.resolution}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">FPS</div>
                  <div className="text-lg font-semibold">{selectedStream.fps}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stream List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Active Streams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStreams.map((stream) => (
                <div
                  key={stream.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStream?.id === stream.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStreamSelect(stream)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(stream.status)}
                      <div>
                        <h4 className="font-semibold">{stream.userName}</h4>
                        <p className="text-sm text-gray-500">{stream.emergencyType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(stream.priority)}`} />
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(stream.duration)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{stream.location.address}</span>
                    <span>{stream.quality}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stream Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Stream Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quality</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                    <Button
                      key={quality}
                      size="sm"
                      variant={streamControls.quality === quality ? "default" : "outline"}
                      onClick={() => handleQualityChange(quality)}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadRecording}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Recording
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleShareStream}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Stream
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Record</span>
                  <Switch
                    checked={autoRecord}
                    onCheckedChange={setAutoRecord}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Controls</span>
                  <Switch
                    checked={showControls}
                    onCheckedChange={setShowControls}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 