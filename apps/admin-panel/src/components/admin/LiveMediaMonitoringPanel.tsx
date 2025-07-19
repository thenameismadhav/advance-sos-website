
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Camera, Mic, MicOff, Volume2, VolumeX, Phone, X } from 'lucide-react';

interface MediaStream {
  id: string;
  user: string;
  type: 'video' | 'audio';
  status: 'active' | 'inactive';
  timestamp: string;
}

interface LiveMediaMonitoringPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const LiveMediaMonitoringPanel = ({ isVisible, onClose }: LiveMediaMonitoringPanelProps) => {
  const [streams] = useState<MediaStream[]>([
    { id: '1', user: 'John Doe', type: 'video', status: 'active', timestamp: '2m ago' },
    { id: '2', user: 'Alice Smith', type: 'audio', status: 'active', timestamp: '5m ago' },
    { id: '3', user: 'Emily Brown', type: 'video', status: 'inactive', timestamp: '12m ago' },
  ]);

  const [mutedStreams, setMutedStreams] = useState<Set<string>>(new Set());

  const toggleMute = (streamId: string) => {
    const newMuted = new Set(mutedStreams);
    if (newMuted.has(streamId)) {
      newMuted.delete(streamId);
    } else {
      newMuted.add(streamId);
    }
    setMutedStreams(newMuted);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[80vh] overflow-hidden bg-gray-900 border-sos-cyan/30">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan flex items-center gap-2">
              <Video className="h-6 w-6" />
              Live Media Monitoring
            </CardTitle>
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="text-sos-cyan hover:bg-sos-cyan/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((stream) => (
              <div key={stream.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                  {stream.type === 'video' ? (
                    stream.status === 'active' ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-sos-cyan mx-auto mb-2" />
                          <p className="text-white text-sm">Live Video</p>
                          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mt-2 animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Video className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Video Inactive</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <Mic className="h-12 w-12 text-sos-cyan mx-auto mb-2" />
                      <p className="text-white text-sm">Audio Only</p>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-8 bg-sos-cyan mx-0.5 rounded ${stream.status === 'active' ? 'animate-pulse' : 'opacity-30'}`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {stream.status === 'active' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{stream.user}</h3>
                    <span className="text-xs text-gray-400">{stream.timestamp}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-sos-cyan hover:bg-sos-cyan/10">
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2 text-sos-cyan hover:bg-sos-cyan/10"
                      onClick={() => toggleMute(stream.id)}
                    >
                      {mutedStreams.has(stream.id) ? 
                        <VolumeX className="h-3 w-3" /> : 
                        <Volume2 className="h-3 w-3" />
                      }
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-sos-cyan hover:bg-sos-cyan/10">
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMediaMonitoringPanel;
