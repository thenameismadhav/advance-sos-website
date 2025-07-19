
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, UserCheck, Heart, MapPin, Clock, X } from 'lucide-react';

interface PersonDetailPanelProps {
  isVisible: boolean;
  onClose: () => void;
  person: {
    id: string;
    name: string;
    role: 'User' | 'Helper' | 'Responder';
    status: 'safe' | 'critical' | 'helping' | 'responding';
    contact: string;
    location: { lat: number; lng: number };
    healthInfo?: string;
    photo?: string;
  } | null;
}

const PersonDetailPanel = ({ isVisible, onClose, person }: PersonDetailPanelProps) => {
  if (!isVisible || !person) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'safe': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'helping': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'responding': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="floating-panel right-6 top-20 w-80">
      <Card className="bg-gray-900/95 backdrop-blur-md border-sos-cyan/30 shadow-lg shadow-sos-cyan/10">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan text-lg">Person Details</CardTitle>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="icon"
              className="h-6 w-6 text-sos-cyan/70 hover:text-sos-cyan hover:bg-sos-cyan/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              {person.photo ? (
                <img src={person.photo} alt={person.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-sos-cyan">{person.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{person.name}</h3>
              <Badge className={getStatusColor(person.status)}>
                {person.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sos-cyan" />
              <span className="text-sm text-gray-300">{person.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sos-cyan" />
              <span className="text-sm text-gray-300">
                {person.location.lat.toFixed(4)}, {person.location.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sos-cyan" />
              <span className="text-sm text-gray-300">Role: {person.role}</span>
            </div>
          </div>

          {/* Health Info */}
          {person.healthInfo && (
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">Health Information</span>
              </div>
              <p className="text-xs text-gray-300">{person.healthInfo}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Phone className="h-4 w-4 mr-2" />
              Call {person.name}
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button className="w-full bg-sos-cyan hover:bg-sos-cyan/90 text-black">
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonDetailPanel;
