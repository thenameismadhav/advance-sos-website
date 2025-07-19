import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Phone, Video } from 'lucide-react';

interface AdminMapOverlayProps {
  selectedLocation: {
    lng: number;
    lat: number;
    level: string;
    user: string;
  } | null;
  onClose: () => void;
}

const AdminMapOverlay = ({ selectedLocation, onClose }: AdminMapOverlayProps) => {
  if (!selectedLocation) return null;

  return (
    <div className="overlay-container bg-black/90 backdrop-blur-sm flex flex-col">
      <div className="p-6 flex justify-between items-center bg-black/80 border-b border-sos-cyan/30">
        <div>
          <h2 className="text-2xl font-bold text-sos-cyan mb-1 uppercase tracking-widest">
            Local Area: <span className="text-white">{selectedLocation.user}'s Location</span>
          </h2>
          <p className="text-gray-400">
            Emergency Level: <span className={`font-semibold ${
              selectedLocation.level === 'Critical' ? 'text-sos-red' : 
              selectedLocation.level === 'Active' ? 'text-yellow-400' : 'text-sos-cyan'
            }`}>{selectedLocation.level}</span>
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-sos-cyan/10 rounded-full">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 relative bg-gray-900">
        <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">
                {selectedLocation.user.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedLocation.user}'s Location
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Interactive map view disabled
            </p>
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-300">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-black/80 backdrop-blur-md border border-sos-cyan/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedLocation.user}</h3>
                <p className="text-gray-400">Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapOverlay;
