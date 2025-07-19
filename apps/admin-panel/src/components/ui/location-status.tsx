import React from 'react';
import { MapPin, Navigation, Wifi, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { LocationData } from '@/services/locationService';

interface LocationStatusProps {
  location: LocationData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  location,
  isLoading = false,
  onRefresh,
  className = ''
}) => {
  const getCityDisplayName = (loc: LocationData) => {
    if (loc.city && loc.country) {
      return `${loc.city}, ${loc.country}`;
    }
    if (loc.city) {
      return loc.city;
    }
    return 'Unknown Location';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-gray-800/50 border border-gray-600 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div>
            <p className="text-sm font-medium text-gray-300">Getting Location...</p>
            <p className="text-xs text-gray-500">Please wait</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!location) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Location Unavailable</p>
            <p className="text-xs text-gray-400">Enable location access to continue</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Retry
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-green-500/10 border border-green-500/20 rounded-lg p-4 ${className}`}
    >
      <div className="space-y-3">
        {/* Main Location Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-300">
              {getCityDisplayName(location)}
            </p>
            <p className="text-xs text-gray-400">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10"
              title="Refresh location"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {location.accuracy && (
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">
                Accuracy: ±{Math.round(location.accuracy)}m
              </span>
            </div>
          )}
          
          {location.timestamp && (
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">
                Updated: {new Date(location.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Address (if available) */}
        {location.address && (
          <div className="pt-2 border-t border-green-500/20">
            <p className="text-xs text-gray-400 leading-relaxed">
              {location.address}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LocationStatus; 