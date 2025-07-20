import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationData, getCurrentLocation, watchLocation, stopWatchingLocation } from '@/services/locationService';

interface LocationContextType {
  userLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestLocationPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [watchId, setWatchId] = useState<number>(-1);

  const requestLocationPermission = async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setHasPermission(true);
      
      // Only start watching if not already watching
      if (watchId === -1) {
      const newWatchId = watchLocation(
        (updatedLocation) => {
          setUserLocation(updatedLocation);
        },
        (watchError) => {
          console.error('Location watch error:', watchError);
          // Don't set error for watch failures, just log them
          // This prevents the error from showing in the UI for minor tracking issues
        }
      );
      setWatchId(newWatchId);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setHasPermission(false);
      
      // Set a default location (Vadodara, India) if location access is denied
      if (errorMessage.includes('denied')) {
        setUserLocation({ lat: 22.3072, lng: 73.1812 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (hasPermission) {
      await requestLocationPermission();
    }
  };

  useEffect(() => {
    // Automatically request location permission when the app loads
    requestLocationPermission();

    // Cleanup function to stop watching location
    return () => {
      if (watchId !== -1) {
        stopWatchingLocation(watchId);
      }
    };
  }, []);

  const value: LocationContextType = {
    userLocation,
    isLoading,
    error,
    hasPermission,
    requestLocationPermission,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 