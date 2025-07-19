import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://odkvcbnsimkhpmkllngo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TEqMgL9G9YLUxfcRpXvvtQ_WuhU82Hn';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          name: string;
          role: 'user' | 'helper' | 'responder' | 'admin';
          avatar_url: string | null;
          is_verified: boolean;
          is_blocked: boolean;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          name: string;
          role?: 'user' | 'helper' | 'responder' | 'admin';
          avatar_url?: string | null;
          is_verified?: boolean;
          is_blocked?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          name?: string;
          role?: 'user' | 'helper' | 'responder' | 'admin';
          avatar_url?: string | null;
          is_verified?: boolean;
          is_blocked?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'super_admin';
          organization: string | null;
          phone: string | null;
          permissions: Record<string, any>;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'super_admin';
          organization?: string | null;
          phone?: string | null;
          permissions?: Record<string, any>;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'super_admin';
          organization?: string | null;
          phone?: string | null;
          permissions?: Record<string, any>;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sos_events: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          address: string | null;
          emergency_type: 'medical' | 'fire' | 'police' | 'accident' | 'other';
          status: 'active' | 'assigned' | 'resolved' | 'cancelled';
          description: string | null;
          priority: number;
          assigned_helper_id: string | null;
          assigned_responder_id: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          latitude: number;
          longitude: number;
          address?: string | null;
          emergency_type: 'medical' | 'fire' | 'police' | 'accident' | 'other';
          status?: 'active' | 'assigned' | 'resolved' | 'cancelled';
          description?: string | null;
          priority?: number;
          assigned_helper_id?: string | null;
          assigned_responder_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          emergency_type?: 'medical' | 'fire' | 'police' | 'accident' | 'other';
          status?: 'active' | 'assigned' | 'resolved' | 'cancelled';
          description?: string | null;
          priority?: number;
          assigned_helper_id?: string | null;
          assigned_responder_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      helpers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          latitude: number;
          longitude: number;
          status: 'available' | 'busy' | 'offline';
          emergency_types: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          max_distance: number;
          rating: number;
          total_helps: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          latitude: number;
          longitude: number;
          status?: 'available' | 'busy' | 'offline';
          emergency_types?: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          max_distance?: number;
          rating?: number;
          total_helps?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          latitude?: number;
          longitude?: number;
          status?: 'available' | 'busy' | 'offline';
          emergency_types?: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          max_distance?: number;
          rating?: number;
          total_helps?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      responders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          organization: string;
          department: string;
          latitude: number;
          longitude: number;
          status: 'available' | 'busy' | 'offline';
          emergency_types: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          organization: string;
          department: string;
          latitude: number;
          longitude: number;
          status?: 'available' | 'busy' | 'offline';
          emergency_types?: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          organization?: string;
          department?: string;
          latitude?: number;
          longitude?: number;
          status?: 'available' | 'busy' | 'offline';
          emergency_types?: ('medical' | 'fire' | 'police' | 'accident' | 'other')[];
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hospitals: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          address: string;
          latitude: number;
          longitude: number;
          emergency_services?: string[];
          is_24_hours?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          emergency_services?: string[];
          is_24_hours?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          sos_event_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: 'image' | 'video' | 'audio';
          file_size: number;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sos_event_id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: 'image' | 'video' | 'audio';
          file_size: number;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sos_event_id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: 'image' | 'video' | 'audio';
          file_size?: number;
          duration?: number | null;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          latitude: number;
          longitude: number;
          address: string | null;
          is_favorite: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          latitude: number;
          longitude: number;
          address?: string | null;
          is_favorite?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          is_favorite?: boolean;
          created_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          relationship: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          relationship: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          relationship?: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          details: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          details?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          details?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      user_locations: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          accuracy: number | null;
          city: string | null;
          country: string | null;
          address: string | null;
          speed: number | null;
          heading: number | null;
          altitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          latitude: number;
          longitude: number;
          accuracy?: number | null;
          city?: string | null;
          country?: string | null;
          address?: string | null;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          latitude?: number;
          longitude?: number;
          accuracy?: number | null;
          city?: string | null;
          country?: string | null;
          address?: string | null;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_locations: {
        Row: {
          id: string;
          user_id: string;
          emergency_id: string;
          latitude: number;
          longitude: number;
          accuracy: number | null;
          city: string | null;
          country: string | null;
          address: string | null;
          speed: number | null;
          heading: number | null;
          altitude: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emergency_id: string;
          latitude: number;
          longitude: number;
          accuracy?: number | null;
          city?: string | null;
          country?: string | null;
          address?: string | null;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emergency_id?: string;
          latitude?: number;
          longitude?: number;
          accuracy?: number | null;
          city?: string | null;
          country?: string | null;
          address?: string | null;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Base interfaces
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

export interface SOSEvent {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'assigned' | 'resolved' | 'cancelled';
  emergency_type: 'medical' | 'fire' | 'police' | 'other';
  description?: string;
  created_at?: string;
  updated_at?: string;
  assigned_helper_id?: string;
  resolved_at?: string;
}

export interface Helper {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'offline';
  emergency_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Responder {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  organization: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'offline';
  emergency_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_services: string[];
  created_at?: string;
}

export interface Media {
  id: string;
  sos_event_id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  created_at?: string;
}

// Auth service
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          role: 'admin'
        }
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Subscribe to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Location service functions
export const locationService = {
  // Fetch all locations
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
    
    return data || [];
  },

  // Insert a new location
  async insertLocation(name: string, latitude: number, longitude: number): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          name,
          latitude,
          longitude
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting location:', error);
      throw error;
    }
    
    return data;
  },

  // Insert a sample location
  async insertSampleLocation(): Promise<Location> {
    return this.insertLocation(
      'Sample Location',
      22.3072, // Vadodara coordinates
      73.1812
    );
  },

  // Subscribe to location changes
  subscribeToLocations(callback: (payload: any) => void) {
    return supabase
      .channel('locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, callback)
      .subscribe();
  }
};

// SOS Events service
export const sosEventService = {
  // Fetch all SOS events
  async getSOSEvents(): Promise<SOSEvent[]> {
    const { data, error } = await supabase
      .from('sos_events')
      .select(`
        *,
        user:users(name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching SOS events:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch active SOS events
  async getActiveSOSEvents(): Promise<SOSEvent[]> {
    const { data, error } = await supabase
      .from('sos_events')
      .select(`
        *,
        user:users(name, email, phone)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching active SOS events:', error);
      throw error;
    }
    
    return data || [];
  },

  // Create new SOS event
  async createSOSEvent(event: Omit<SOSEvent, 'id' | 'created_at' | 'updated_at'>): Promise<SOSEvent> {
    const { data, error } = await supabase
      .from('sos_events')
      .insert([event])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating SOS event:', error);
      throw error;
    }
    
    return data;
  },

  // Update SOS event status
  async updateSOSEventStatus(id: string, status: SOSEvent['status'], assigned_helper_id?: string): Promise<SOSEvent> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (assigned_helper_id) updateData.assigned_helper_id = assigned_helper_id;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('sos_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating SOS event:', error);
      throw error;
    }
    
    return data;
  },

  // Subscribe to SOS event changes
  subscribeToSOSEvents(callback: (payload: any) => void) {
    return supabase
      .channel('sos_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_events' }, callback)
      .subscribe();
  }
};

// Helpers service
export const helperService = {
  // Fetch all helpers
  async getHelpers(): Promise<Helper[]> {
    const { data, error } = await supabase
      .from('helpers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching helpers:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch available helpers
  async getAvailableHelpers(): Promise<Helper[]> {
    const { data, error } = await supabase
      .from('helpers')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available helpers:', error);
      throw error;
    }
    
    return data || [];
  },

  // Update helper location
  async updateHelperLocation(id: string, latitude: number, longitude: number): Promise<Helper> {
    const { data, error } = await supabase
      .from('helpers')
      .update({ 
        latitude, 
        longitude, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating helper location:', error);
      throw error;
    }
    
    return data;
  },

  // Subscribe to helper changes
  subscribeToHelpers(callback: (payload: any) => void) {
    return supabase
      .channel('helpers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'helpers' }, callback)
      .subscribe();
  }
};

// Responders service
export const responderService = {
  // Fetch all responders
  async getResponders(): Promise<Responder[]> {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching responders:', error);
      throw error;
    }
    
    return data || [];
  },

  // Fetch available responders
  async getAvailableResponders(): Promise<Responder[]> {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available responders:', error);
      throw error;
    }
    
    return data || [];
  },

  // Subscribe to responder changes
  subscribeToResponders(callback: (payload: any) => void) {
    return supabase
      .channel('responders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responders' }, callback)
      .subscribe();
  }
};

// Hospitals service
export const hospitalService = {
  // Fetch all hospitals
  async getHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching hospitals:', error);
      throw error;
    }
    
    return data || [];
  },

  // Subscribe to hospital changes
  subscribeToHospitals(callback: (payload: any) => void) {
    return supabase
      .channel('hospitals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, callback)
      .subscribe();
  }
};

// Media service
export const mediaService = {
  // Fetch media for SOS event
  async getMediaForSOSEvent(sosEventId: string): Promise<Media[]> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('sos_event_id', sosEventId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
    
    return data || [];
  },

  // Subscribe to media changes
  subscribeToMedia(callback: (payload: any) => void) {
    return supabase
      .channel('media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, callback)
      .subscribe();
  }
}; 