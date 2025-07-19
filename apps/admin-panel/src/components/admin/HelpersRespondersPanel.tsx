import React from 'react';
import { Users, MapPin, Clock, Phone, Shield, Star, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HelpersRespondersPanelProps {
  helpers: any[];
  etas: { victimId: number; helperId: number; eta: string; distance: string }[];
  addresses: { [key: string]: string };
  elevations: { [key: string]: number };
  highlightHelperId?: number;
}

const HelpersRespondersPanel: React.FC<HelpersRespondersPanelProps> = ({ helpers, etas, addresses, elevations, highlightHelperId }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'On Call': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'On Duty': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Active Responders</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{helpers.length}</div>
            <div className="text-gray-400">Total</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Nearby Responders
        </h4>
        {helpers.map((helper) => (
          <div key={helper.id} className={`bg-gray-800/50 border border-gray-600 rounded-lg p-3 space-y-3 ${highlightHelperId === helper.id ? 'ring-2 ring-blue-400' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{helper.avatar || helper.name?.split(' ').map((n: string) => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-medium text-white">{helper.name}</h5>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-400">{helper.rating || ''}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{helper.role || ''}</p>
              </div>
              <Badge className={getStatusColor(helper.status || 'Available')}>
                {helper.status || 'Available'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {helper.specializations?.map((spec: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
                  {spec}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{addresses[helper.id]}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>ETA: {etas.find(e => e.helperId === helper.id)?.eta || '--'}</span>
            </div>

            <div className="flex items-center gap-1 text-purple-400 text-xs">
              Elevation: {elevations[helper.id] ? `${Math.round(elevations[helper.id])}m` : '--'}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
              <Button size="sm" variant="outline" className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alert
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              📍 {helper.location || ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpersRespondersPanel; 