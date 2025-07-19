import React from 'react';
import { User, Phone, MapPin, Clock, AlertTriangle, Heart, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VictimsDetailsPanelProps {
  victims: any[];
  etas: { victimId: number; helperId: number; eta: string; distance: string }[];
  addresses: { [key: string]: string };
  elevations: { [key: string]: number };
}

const VictimsDetailsPanel: React.FC<VictimsDetailsPanelProps> = ({ victims, etas, addresses, elevations }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Active': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Moderate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <User className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Active Victims</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{victims.length}</div>
            <div className="text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Victims List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Emergency Cases
        </h4>
        
        {victims.map((victim) => (
          <div key={victim.id} className={`bg-gray-800/50 border border-gray-600 rounded-lg p-3 space-y-3`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{victim.avatar || victim.name?.split(' ').map((n: string) => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-medium text-white">{victim.name}</h5>
                  <span className="text-xs text-gray-400">({victim.age || '--'} yrs)</span>
                </div>
                <p className="text-xs text-gray-400">{victim.emergency || ''}</p>
              </div>
              <Badge className={getStatusColor(victim.status || 'Critical')}>
                {victim.status || 'Critical'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1 text-blue-400`}>
                <MapPin className="w-3 h-3" />
                <span>{addresses[victim.id]}</span>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <Clock className="w-3 h-3" />
                <span>ETA: {etas.find(e => e.victimId === victim.id)?.eta || '--'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-purple-400 text-xs">
              Elevation: {elevations[victim.id] ? `${Math.round(elevations[victim.id])}m` : '--'}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs">
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
              <Button size="sm" variant="outline" className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700">
                <Shield className="w-3 h-3 mr-1" />
                Track
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Actions */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Emergency Actions</h4>
        <div className="space-y-2">
          <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white text-xs">
            Dispatch All Units
          </Button>
          <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
            Send Medical Alert
          </Button>
          <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
            View All Cases
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VictimsDetailsPanel; 