
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Camera, Users, Shield, CheckCircle, X } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'triggered' | 'location' | 'media' | 'helper' | 'responder' | 'closed';
  description: string;
  details?: string;
}

interface SOSTimelineViewerProps {
  isVisible: boolean;
  onClose: () => void;
  sosId: string;
}

const SOSTimelineViewer = ({ isVisible, onClose, sosId }: SOSTimelineViewerProps) => {
  const timelineEvents: TimelineEvent[] = [
    { id: '1', timestamp: '14:32:15', type: 'triggered', description: 'SOS Alert Triggered', details: 'Emergency button pressed by John Doe' },
    { id: '2', timestamp: '14:32:18', type: 'location', description: 'Location Updated', details: 'GPS coordinates acquired: 40.7128, -74.0060' },
    { id: '3', timestamp: '14:32:25', type: 'media', description: 'Media Captured', details: 'Photo and audio recording started' },
    { id: '4', timestamp: '14:33:02', type: 'helper', description: 'Helper Assigned', details: 'Alice Smith assigned (0.3 mi away)' },
    { id: '5', timestamp: '14:34:15', type: 'responder', description: 'Responder Dispatched', details: 'Emergency services notified' },
    { id: '6', timestamp: '14:45:30', type: 'closed', description: 'SOS Resolved', details: 'Emergency resolved successfully' },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'triggered': return <Clock className="h-4 w-4 text-red-500" />;
      case 'location': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'media': return <Camera className="h-4 w-4 text-purple-500" />;
      case 'helper': return <Users className="h-4 w-4 text-green-500" />;
      case 'responder': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-gray-900 border-sos-cyan/30">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan flex items-center gap-2">
              <Clock className="h-6 w-6" />
              SOS Timeline - Case #{sosId}
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
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-sos-cyan/30">
                    {getEventIcon(event.type)}
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="w-0.5 h-8 bg-sos-cyan/30 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{event.description}</span>
                    <span className="text-xs text-gray-400">{event.timestamp}</span>
                  </div>
                  {event.details && (
                    <p className="text-sm text-gray-300">{event.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSTimelineViewer;
