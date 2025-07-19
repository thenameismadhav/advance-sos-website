import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Video, X } from 'lucide-react';

interface AdminLiveVideoPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const AdminLiveVideoPanel = ({ isVisible, onClose }: AdminLiveVideoPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="floating-panel bottom-24 right-6 w-80">
      <div className="bg-black/80 backdrop-blur-md border border-sos-cyan/30 rounded-lg overflow-hidden shadow-lg shadow-sos-cyan/10">
        <div className="bg-sos-cyan/10 p-2 border-b border-sos-cyan/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-sos-cyan uppercase tracking-wider ml-2">Live Feed: John Doe</h3>
          <div className="flex space-x-1">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-sos-cyan/70 hover:bg-sos-cyan/10 hover:text-sos-cyan">
              <Volume2 className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-sos-cyan/70 hover:bg-sos-cyan/10 hover:text-sos-cyan">
              <Video className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-sos-cyan/70 hover:bg-sos-cyan/10 hover:text-sos-cyan" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="bg-gray-900 aspect-video w-full flex items-center justify-center">
          <div className="text-center p-4">
            <Video className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Waiting for John to connect...</p>
            <div className="mt-2 flex justify-center">
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2 border-t border-sos-cyan/30">
          <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden">
            <div className="w-full h-full relative flex items-center">
              <div className="absolute left-0 right-0 px-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>00:00</span>
                  <span className="uppercase text-sos-cyan/70">Audio Levels</span>
                </div>
              </div>
              <div className="h-2 bg-sos-cyan w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveVideoPanel;
