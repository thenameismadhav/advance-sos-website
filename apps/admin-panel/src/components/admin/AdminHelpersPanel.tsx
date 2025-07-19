import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, X } from 'lucide-react';

interface AdminHelpersPanelProps {
  isVisible: boolean;
  totalAlerts: number;
  onClose: () => void;
}

const AdminHelpersPanel = ({ isVisible, totalAlerts, onClose }: AdminHelpersPanelProps) => {
  if (!isVisible) return null;

  const helpers = [
    { name: "John Doe", status: "Accepted", avatar: "JD", distance: "0.3 mi", eta: "2 min", location: "Vadodara, Gujarat, India" },
    { name: "Alex Smith", status: "Pending", avatar: "AS", distance: "0.8 mi", eta: "5 min", location: "Vadodara, Gujarat, India" },
    { name: "Emily Brown", status: "Accepted", avatar: "EB", distance: "1.2 mi", eta: "7 min", location: "Vadodara, Gujarat, India" },
  ];

  return (
    <div className="floating-panel top-20 left-6 w-72">
      <div className="bg-black/80 backdrop-blur-md border border-sos-cyan/30 rounded-lg overflow-hidden shadow-lg shadow-sos-cyan/10">
        <div className="bg-sos-cyan/10 p-3 border-b border-sos-cyan/30 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-3 text-sos-cyan" />
            <h2 className="text-md font-bold uppercase tracking-widest text-sos-cyan">Nearby Helpers</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-sos-cyan/70 hover:text-sos-cyan hover:bg-sos-cyan/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          {helpers.map((helper, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 hover:bg-gray-900/50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-sm text-gray-300">{helper.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{helper.name}</div>
                <div className="text-xs text-gray-500">{helper.location}</div>
                <div className="text-xs text-gray-500">{helper.distance} <span className="ml-2 text-sos-cyan">ETA: {helper.eta}</span></div>
              </div>
              <div className={`text-sm font-medium ${helper.status === 'Accepted' ? 'text-green-500' : 'text-amber-500'}`}>
                {helper.status}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-sos-cyan/30">
          <div className="text-center text-sm text-gray-500 uppercase tracking-wider">
            Total Alerts Served: <span className="font-bold text-sos-cyan">{totalAlerts.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHelpersPanel;
