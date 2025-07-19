import React from 'react';

export interface Path {
  id: string;
  from: { lat: number; lng: number; label: string };
  to: { lat: number; lng: number; label: string };
  eta: string;
  distance: string;
  type: 'responder' | 'helper' | 'user';
}

interface GeoPathTrackerProps {
  map: any | null;
  paths: Path[];
  userLocation?: { lat: number; lng: number };
}

const GeoPathTracker: React.FC<GeoPathTrackerProps> = ({ map, paths }) => {
  // This component has been disabled due to Google Maps removal
  // Use the Location Manager for path tracking functionality
  return null;
};

export default GeoPathTracker;
