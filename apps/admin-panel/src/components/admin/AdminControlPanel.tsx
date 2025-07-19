import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Video, AlertCircle, Map as MapIcon, Shield } from 'lucide-react';

interface AdminControlPanelProps {
  showHelpers: boolean;
  showLiveVideo: boolean;
  showAlerts: boolean;
  showSecurity: boolean;
  onToggleHelpers: () => void;
  onToggleLiveVideo: () => void;
  onToggleAlerts: () => void;
  onToggleSecurity: () => void;
  onResetView: () => void;
}

const AdminControlPanel = ({
  showHelpers,
  showLiveVideo,
  showAlerts,
  showSecurity,
  onToggleHelpers,
  onToggleLiveVideo,
  onToggleAlerts,
  onToggleSecurity,
  onResetView
}: AdminControlPanelProps) => {
  return (
    <div className="floating-panel bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-lg border border-red-500/20">
        <Button 
          onClick={onToggleHelpers} 
          className={`rounded-full transition-all ${showHelpers ? 'bg-red-500 text-white' : 'bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10'}`}
          size="icon"
          title="Toggle Helpers Panel"
        >
          <Users className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={onToggleLiveVideo} 
          className={`rounded-full transition-all ${showLiveVideo ? 'bg-blue-500 text-white' : 'bg-transparent border border-blue-500/50 text-blue-500 hover:bg-blue-500/10'}`}
          size="icon"
          title="Toggle Live Video"
        >
          <Video className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={onToggleAlerts} 
          className={`rounded-full transition-all ${showAlerts ? 'bg-red-500 text-white' : 'bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10'}`} 
          size="icon"
          title="Toggle Alerts Panel"
        >
          <AlertCircle className="h-5 w-5" />
        </Button>

        <Button 
          onClick={onToggleSecurity} 
          className={`rounded-full transition-all ${showSecurity ? 'bg-purple-500 text-white' : 'bg-transparent border border-purple-500/50 text-purple-500 hover:bg-purple-500/10'}`} 
          size="icon"
          title="Security Dashboard"
        >
          <Shield className="h-5 w-5" />
        </Button>
        
        <div className="h-8 w-px bg-gray-600"></div>
        
        <Button
          onClick={onResetView}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:bg-gray-700 transition-all rounded-full"
          title="Reset All Views"
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Reset View
        </Button>
      </div>
    </div>
  );
};

export default AdminControlPanel;
