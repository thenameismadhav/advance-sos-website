export type EmergencyType = 'medical' | 'fire' | 'police' | 'accident' | 'other';
export type SOSStatus = 'active' | 'assigned' | 'resolved' | 'cancelled';
export type HelperStatus = 'available' | 'busy' | 'offline';

export interface SOSEvent {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  emergency_type: EmergencyType;
  status: SOSStatus;
  description: string | null;
  priority: number;
  assigned_helper_id: string | null;
  assigned_responder_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    phone: string;
    email: string;
  };
  assigned_helper?: {
    id: string;
    name: string;
    phone: string;
  };
  assigned_responder?: {
    id: string;
    name: string;
    phone: string;
    organization: string;
  };
  media?: Media[];
}

export interface Helper {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: HelperStatus;
  emergency_types: EmergencyType[];
  max_distance: number;
  rating: number;
  total_helps: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    avatar_url: string | null;
  };
}

export interface Responder {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  organization: string;
  department: string;
  latitude: number;
  longitude: number;
  status: HelperStatus;
  emergency_types: EmergencyType[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    avatar_url: string | null;
  };
}

export interface Hospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  emergency_services: string[];
  is_24_hours: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  user_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface SOSEventFilters {
  status?: SOSStatus[];
  emergency_type?: EmergencyType[];
  priority?: number[];
  date_from?: string;
  date_to?: string;
  assigned?: boolean;
  search?: string;
}

export interface HelperFilters {
  status?: HelperStatus[];
  emergency_types?: EmergencyType[];
  verified?: boolean;
  search?: string;
}

export interface ResponderFilters {
  status?: HelperStatus[];
  emergency_types?: EmergencyType[];
  organization?: string;
  verified?: boolean;
  search?: string;
}

export interface SOSEventStats {
  total: number;
  active: number;
  assigned: number;
  resolved: number;
  cancelled: number;
  byType: Record<EmergencyType, number>;
  byPriority: Record<number, number>;
  avgResponseTime: number;
  avgResolutionTime: number;
}

export interface HelperStats {
  total: number;
  available: number;
  busy: number;
  offline: number;
  verified: number;
  avgRating: number;
  totalHelps: number;
}

export interface ResponderStats {
  total: number;
  available: number;
  busy: number;
  offline: number;
  verified: number;
  byOrganization: Record<string, number>;
}

export interface MapMarker {
  id: string;
  type: 'sos' | 'helper' | 'responder' | 'hospital' | 'user';
  latitude: number;
  longitude: number;
  data: SOSEvent | Helper | Responder | Hospital | Location;
  popup?: {
    title: string;
    content: string;
    actions?: Array<{
      label: string;
      action: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  };
}

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in seconds
  polyline: [number, number][]; // coordinates for route display
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
} 