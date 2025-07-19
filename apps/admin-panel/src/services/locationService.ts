import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  city?: string;
  country?: string;
  address?: string;
  speed?: number;
  heading?: number;
  altitude?: number;
}

export interface EmergencyLocation extends LocationData {
  id?: string;
  user_id?: string;
  emergency_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LocationPermission {
  granted: boolean;
  type: 'granted' | 'denied' | 'prompt' | 'unsupported';
  message: string;
}

// Location tracking state
let locationWatchId: number | null = null;
let isTracking = false;
let currentLocation: LocationData | null = null;

// Location permission check
export const checkLocationPermission = async (): Promise<LocationPermission> => {
  if (!navigator.geolocation) {
    return {
      granted: false,
      type: 'unsupported',
      message: 'Geolocation is not supported by this browser.'
    };
  }

  try {
    // Check if permission is already granted
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return {
        granted: permission.state === 'granted',
        type: permission.state as 'granted' | 'denied' | 'prompt',
        message: permission.state === 'granted' 
          ? 'Location access granted.' 
          : permission.state === 'denied' 
            ? 'Location access denied. Please enable in browser settings.'
            : 'Location permission not yet requested.'
      };
    }

    // Fallback for browsers that don't support permissions API
    return {
      granted: true,
      type: 'prompt',
      message: 'Location permission status unknown. Will request when needed.'
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      type: 'unsupported',
      message: 'Unable to check location permission.'
    };
  }
};

// Request location permission
export const requestLocationPermission = async (): Promise<LocationPermission> => {
  const permission = await checkLocationPermission();
  
  if (permission.type === 'granted') {
    return permission;
  }

  if (permission.type === 'denied') {
    toast({
      title: "Location Access Required",
      description: "Please enable location access in your browser settings to use emergency features.",
      variant: "destructive",
    });
    return permission;
  }

  // Try to get current location to trigger permission request
  try {
    await getCurrentLocation();
    return await checkLocationPermission();
  } catch (error) {
  return {
      granted: false,
      type: 'denied',
      message: 'Location permission denied by user.'
    };
  }
};

// Enhanced getCurrentLocation with comprehensive error handling
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser.');
      toast({
        title: "Location Error",
        description: error.message,
        variant: "destructive",
      });
      reject(error);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          altitude: position.coords.altitude || undefined
        };

        try {
          // Get city information
          const cityInfo = await getCityFromCoordinates(locationData.lat, locationData.lng);
          locationData.city = cityInfo.city;
          locationData.country = cityInfo.country;
          locationData.address = cityInfo.address;
        } catch (error) {
          console.error('Error getting city info:', error);
          // Fallback to simple city detection
          locationData.city = getSimpleCityName(locationData.lat, locationData.lng);
          locationData.country = getCountryFromCity(locationData.city);
          locationData.address = `${locationData.city}, ${locationData.country}`;
        }

        currentLocation = locationData;
        resolve(locationData);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is currently unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please check your connection and try again.';
            break;
        }
        
        const locationError = new Error(errorMessage);
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        reject(locationError);
      },
      options
    );
  });
};

// Enhanced city detection with Mapbox integration
export const getCityFromCoordinates = async (lat: number, lng: number): Promise<{ city: string; country: string; address: string }> => {
  try {
    // Try Mapbox geocoding first
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (mapboxToken) {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=place,locality&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const city = feature.text || feature.place_name?.split(',')[0] || 'Unknown City';
          const country = feature.context?.find((ctx: any) => ctx.id.startsWith('country'))?.text || 'Unknown Country';
          
          return {
            city,
            country,
            address: feature.place_name || `${city}, ${country}`
          };
        }
      }
    }
  } catch (error) {
    console.error('Mapbox geocoding failed:', error);
  }

  // Fallback to simple city detection
  const city = getSimpleCityName(lat, lng);
  const country = getCountryFromCity(city);
  
  return {
    city,
    country,
    address: `${city}, ${country}`
  };
};

// Simple city detection as fallback
const getSimpleCityName = (lat: number, lng: number): string => {
  if (lat >= 22.2 && lat <= 22.4 && lng >= 73.1 && lng <= 73.2) {
    return 'Vadodara';
  }
  if (lat >= 19.0 && lat <= 19.2 && lng >= 72.8 && lng <= 73.0) {
    return 'Mumbai';
  }
  if (lat >= 28.6 && lat <= 28.8 && lng >= 77.1 && lng <= 77.3) {
    return 'New Delhi';
  }
  if (lat >= 40.7 && lat <= 40.8 && lng >= -74.0 && lng <= -74.1) {
    return 'New York';
  }
  if (lat >= 51.5 && lat <= 51.6 && lng >= -0.1 && lng <= -0.2) {
    return 'London';
  }
  return 'Your City';
};

// Helper function to get country from city
const getCountryFromCity = (city: string): string => {
  const cityCountryMap: { [key: string]: string } = {
    'Vadodara': 'India',
    'Mumbai': 'India',
    'New Delhi': 'India',
    'New York': 'United States',
    'London': 'United Kingdom',
    'Your City': 'Unknown'
  };
  
  return cityCountryMap[city] || 'Unknown';
};

// Start real-time location tracking
export const startLocationTracking = (
  onLocationUpdate: (location: LocationData) => void,
  onError: (error: Error) => void,
  options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    trackInSupabase?: boolean;
  } = {}
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (isTracking) {
      reject(new Error('Location tracking is already active.'));
      return;
    }

  if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser.');
      onError(error);
      reject(error);
      return;
    }

    const trackingOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 30000
    };

    locationWatchId = navigator.geolocation.watchPosition(
    async (position) => {
      const locationData: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          altitude: position.coords.altitude || undefined
      };

      try {
        // Get city information
        const cityInfo = await getCityFromCoordinates(locationData.lat, locationData.lng);
        locationData.city = cityInfo.city;
        locationData.country = cityInfo.country;
        locationData.address = cityInfo.address;
      } catch (error) {
        console.error('Error getting city info:', error);
        // Fallback to simple city detection
        locationData.city = getSimpleCityName(locationData.lat, locationData.lng);
          locationData.country = getCountryFromCity(locationData.city);
          locationData.address = `${locationData.city}, ${locationData.country}`;
      }

        currentLocation = locationData;
      onLocationUpdate(locationData);

        // Track in Supabase if enabled
        if (options.trackInSupabase) {
          await trackLocationInSupabase(locationData);
        }
    },
    (error) => {
        let errorMessage = 'Location tracking failed.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        const locationError = new Error(errorMessage);
        onError(locationError);
        isTracking = false;
      },
      trackingOptions
    );

    isTracking = true;
    resolve(locationWatchId);
  });
};

// Stop location tracking
export const stopLocationTracking = (): void => {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
    isTracking = false;
  }
};

// Get current tracking status
export const getTrackingStatus = (): { isTracking: boolean; watchId: number | null } => {
  return {
    isTracking,
    watchId: locationWatchId
  };
};

// Get last known location
export const getLastKnownLocation = (): LocationData | null => {
  return currentLocation;
};

// Track location in Supabase
export const trackLocationInSupabase = async (locationData: LocationData): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No authenticated user for location tracking');
      return;
    }

    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: user.id,
        latitude: locationData.lat,
        longitude: locationData.lng,
        accuracy: locationData.accuracy,
        city: locationData.city,
        country: locationData.country,
        address: locationData.address,
        speed: locationData.speed,
        heading: locationData.heading,
        altitude: locationData.altitude,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking location in Supabase:', error);
    }
  } catch (error) {
    console.error('Error tracking location in Supabase:', error);
  }
};

// Share emergency location
export const shareEmergencyLocation = async (
  emergencyId: string,
  locationData: LocationData
): Promise<EmergencyLocation> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const emergencyLocation: Omit<EmergencyLocation, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      emergency_id: emergencyId,
      lat: locationData.lat,
      lng: locationData.lng,
      accuracy: locationData.accuracy,
      timestamp: locationData.timestamp,
      city: locationData.city,
      country: locationData.country,
      address: locationData.address,
      speed: locationData.speed,
      heading: locationData.heading,
      altitude: locationData.altitude,
      is_active: true
    };

    const { data, error } = await supabase
      .from('emergency_locations')
      .insert(emergencyLocation)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: "Location Shared",
      description: "Your emergency location has been shared with responders.",
    });

    return data;
  } catch (error) {
    console.error('Error sharing emergency location:', error);
    toast({
      title: "Location Share Failed",
      description: "Failed to share your emergency location. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// Get emergency locations for an emergency
export const getEmergencyLocations = async (emergencyId: string): Promise<EmergencyLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('emergency_locations')
      .select('*')
      .eq('emergency_id', emergencyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching emergency locations:', error);
    throw error;
  }
};

// Update emergency location
export const updateEmergencyLocation = async (
  locationId: string,
  updates: Partial<EmergencyLocation>
): Promise<EmergencyLocation> => {
  try {
    const { data, error } = await supabase
      .from('emergency_locations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating emergency location:', error);
    throw error;
  }
};

// Deactivate emergency location
export const deactivateEmergencyLocation = async (locationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('emergency_locations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deactivating emergency location:', error);
    throw error;
  }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find nearby responders
export const findNearbyResponders = async (
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('is_available', true)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Filter responders within radius
    const nearbyResponders = data?.filter(responder => {
      const distance = calculateDistance(lat, lng, responder.latitude, responder.longitude);
      return distance <= radiusKm;
    }) || [];

    // Sort by distance
    return nearbyResponders.sort((a, b) => {
      const distanceA = calculateDistance(lat, lng, a.latitude, a.longitude);
      const distanceB = calculateDistance(lat, lng, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  } catch (error) {
    console.error('Error finding nearby responders:', error);
    throw error;
  }
};

// Get location history for a user
export const getLocationHistory = async (
  userId: string,
  limit: number = 100
): Promise<LocationData[]> => {
  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data?.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: new Date(loc.created_at).getTime(),
      city: loc.city,
      country: loc.country,
      address: loc.address,
      speed: loc.speed,
      heading: loc.heading,
      altitude: loc.altitude
    })) || [];
  } catch (error) {
    console.error('Error fetching location history:', error);
    throw error;
  }
};

// Clear location history for a user
export const clearLocationHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_locations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    toast({
      title: "History Cleared",
      description: "Your location history has been cleared.",
    });
  } catch (error) {
    console.error('Error clearing location history:', error);
    toast({
      title: "Clear Failed",
      description: "Failed to clear location history. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// Export legacy functions for backward compatibility
export const watchLocation = startLocationTracking;
export const stopWatchingLocation = stopLocationTracking;
