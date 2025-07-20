import { supabase } from '../supabase';
import { 
  SOSEvent, 
  Helper, 
  Responder, 
  Hospital, 
  Location,
  SOSEventFilters,
  HelperFilters,
  ResponderFilters,
  SOSEventStats,
  HelperStats,
  ResponderStats,
  EmergencyContact
} from '@/types/sos';

export class APIService {
  // SOS Events
  static async getSOSEvents(filters?: SOSEventFilters): Promise<{ events: SOSEvent[]; error: any }> {
    try {
      let query = supabase
        .from('sos_events')
        .select(`
          *,
          user:users(name, phone, email),
          assigned_helper:helpers!assigned_helper_id(id, name, phone),
          assigned_responder:responders!assigned_responder_id(id, name, phone, organization)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.emergency_type?.length) {
        query = query.in('emergency_type', filters.emergency_type);
      }

      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters?.assigned !== undefined) {
        if (filters.assigned) {
          query = query.not('assigned_helper_id', 'is', null);
        } else {
          query = query.is('assigned_helper_id', null);
        }
      }

      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,user.name.ilike.%${filters.search}%`);
      }

      const { data: events, error } = await query;

      if (error) {
        console.warn('Error fetching SOS events:', error);
        // Return empty array instead of throwing error
        return { events: [], error };
      }

      return { events: events || [], error: null };
    } catch (error) {
      console.warn('Exception fetching SOS events:', error);
      return { events: [], error };
    }
  }

  static async getSOSEvent(id: string): Promise<{ event: SOSEvent | null; error: any }> {
    try {
      const { data: event, error } = await supabase
        .from('sos_events')
        .select(`
          *,
          user:users(name, phone, email),
          assigned_helper:helpers!assigned_helper_id(id, name, phone),
          assigned_responder:responders!assigned_responder_id(id, name, phone, organization),
          media(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { event, error: null };
    } catch (error) {
      return { event: null, error };
    }
  }

  static async updateSOSEvent(id: string, updates: Partial<SOSEvent>): Promise<{ event: SOSEvent | null; error: any }> {
    try {
      const { data: event, error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { event, error: null };
    } catch (error) {
      return { event: null, error };
    }
  }

  static async deleteSOSEvent(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('sos_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async getSOSEventStats(): Promise<{ stats: SOSEventStats; error: any }> {
    try {
      const { data: events, error } = await supabase
        .from('sos_events')
        .select('*');

      if (error) throw error;

      const stats: SOSEventStats = {
        total: events?.length || 0,
        active: events?.filter(e => e.status === 'active').length || 0,
        assigned: events?.filter(e => e.status === 'assigned').length || 0,
        resolved: events?.filter(e => e.status === 'resolved').length || 0,
        cancelled: events?.filter(e => e.status === 'cancelled').length || 0,
        byType: {
          medical: events?.filter(e => e.emergency_type === 'medical').length || 0,
          fire: events?.filter(e => e.emergency_type === 'fire').length || 0,
          police: events?.filter(e => e.emergency_type === 'police').length || 0,
          accident: events?.filter(e => e.emergency_type === 'accident').length || 0,
          other: events?.filter(e => e.emergency_type === 'other').length || 0,
        },
        byPriority: {
          1: events?.filter(e => e.priority === 1).length || 0,
          2: events?.filter(e => e.priority === 2).length || 0,
          3: events?.filter(e => e.priority === 3).length || 0,
          4: events?.filter(e => e.priority === 4).length || 0,
          5: events?.filter(e => e.priority === 5).length || 0,
        },
        avgResponseTime: 0, // Calculate based on assignment time
        avgResolutionTime: 0, // Calculate based on resolution time
      };

      return { stats, error: null };
    } catch (error) {
      return { 
        stats: {
          total: 0,
          active: 0,
          assigned: 0,
          resolved: 0,
          cancelled: 0,
          byType: { medical: 0, fire: 0, police: 0, accident: 0, other: 0 },
          byPriority: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          avgResponseTime: 0,
          avgResolutionTime: 0,
        }, 
        error 
      };
    }
  }

  // Helpers
  static async getHelpers(filters?: HelperFilters): Promise<{ helpers: Helper[]; error: any }> {
    try {
      let query = supabase
        .from('helpers')
        .select(`
          *,
          user:users(email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.emergency_types?.length) {
        query = query.overlaps('emergency_types', filters.emergency_types);
      }

      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data: helpers, error } = await query;

      if (error) {
        console.warn('Error fetching helpers:', error);
        // Return empty array instead of throwing error
        return { helpers: [], error };
      }

      return { helpers: helpers || [], error: null };
    } catch (error) {
      console.warn('Exception fetching helpers:', error);
      return { helpers: [], error };
    }
  }

  static async getHelper(id: string): Promise<{ helper: Helper | null; error: any }> {
    try {
      const { data: helper, error } = await supabase
        .from('helpers')
        .select(`
          *,
          user:users(email, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { helper, error: null };
    } catch (error) {
      return { helper: null, error };
    }
  }

  static async updateHelper(id: string, updates: Partial<Helper>): Promise<{ helper: Helper | null; error: any }> {
    try {
      const { data: helper, error } = await supabase
        .from('helpers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { helper, error: null };
    } catch (error) {
      return { helper: null, error };
    }
  }

  static async getHelperStats(): Promise<{ stats: HelperStats; error: any }> {
    try {
      const { data: helpers, error } = await supabase
        .from('helpers')
        .select('*');

      if (error) throw error;

      const stats: HelperStats = {
        total: helpers?.length || 0,
        available: helpers?.filter(h => h.status === 'available').length || 0,
        busy: helpers?.filter(h => h.status === 'busy').length || 0,
        offline: helpers?.filter(h => h.status === 'offline').length || 0,
        verified: helpers?.filter(h => h.is_verified).length || 0,
        avgRating: helpers?.reduce((sum, h) => sum + h.rating, 0) / (helpers?.length || 1),
        totalHelps: helpers?.reduce((sum, h) => sum + h.total_helps, 0) || 0,
      };

      return { stats, error: null };
    } catch (error) {
      return { 
        stats: {
          total: 0,
          available: 0,
          busy: 0,
          offline: 0,
          verified: 0,
          avgRating: 0,
          totalHelps: 0,
        }, 
        error 
      };
    }
  }

  // Responders
  static async getResponders(filters?: ResponderFilters): Promise<{ responders: Responder[]; error: any }> {
    try {
      let query = supabase
        .from('responders')
        .select(`
          *,
          user:users(email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.emergency_types?.length) {
        query = query.overlaps('emergency_types', filters.emergency_types);
      }

      if (filters?.organization) {
        query = query.eq('organization', filters.organization);
      }

      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,organization.ilike.%${filters.search}%`);
      }

      const { data: responders, error } = await query;

      if (error) {
        console.warn('Error fetching responders:', error);
        // Return empty array instead of throwing error
        return { responders: [], error };
      }

      return { responders: responders || [], error: null };
    } catch (error) {
      console.warn('Exception fetching responders:', error);
      return { responders: [], error };
    }
  }

  static async getResponderStats(): Promise<{ stats: ResponderStats; error: any }> {
    try {
      const { data: responders, error } = await supabase
        .from('responders')
        .select('*');

      if (error) throw error;

      const byOrganization: Record<string, number> = {};
      responders?.forEach(r => {
        byOrganization[r.organization] = (byOrganization[r.organization] || 0) + 1;
      });

      const stats: ResponderStats = {
        total: responders?.length || 0,
        available: responders?.filter(r => r.status === 'available').length || 0,
        busy: responders?.filter(r => r.status === 'busy').length || 0,
        offline: responders?.filter(r => r.status === 'offline').length || 0,
        verified: responders?.filter(r => r.is_verified).length || 0,
        byOrganization,
      };

      return { stats, error: null };
    } catch (error) {
      return { 
        stats: {
          total: 0,
          available: 0,
          busy: 0,
          offline: 0,
          verified: 0,
          byOrganization: {},
        }, 
        error 
      };
    }
  }

  // Hospitals
  static async getHospitals(): Promise<{ hospitals: Hospital[]; error: any }> {
    try {
      const { data: hospitals, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return { hospitals: hospitals || [], error: null };
    } catch (error) {
      return { hospitals: [], error };
    }
  }

  static async createHospital(hospitalData: Omit<Hospital, 'id' | 'created_at' | 'updated_at'>): Promise<{ hospital: Hospital | null; error: any }> {
    try {
      const { data: hospital, error } = await supabase
        .from('hospitals')
        .insert(hospitalData)
        .select()
        .single();

      if (error) throw error;

      return { hospital, error: null };
    } catch (error) {
      return { hospital: null, error };
    }
  }

  static async updateHospital(id: string, updates: Partial<Hospital>): Promise<{ hospital: Hospital | null; error: any }> {
    try {
      const { data: hospital, error } = await supabase
        .from('hospitals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { hospital, error: null };
    } catch (error) {
      return { hospital: null, error };
    }
  }

  static async deleteHospital(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Locations
  static async getLocations(): Promise<{ locations: Location[]; error: any }> {
    try {
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { locations: locations || [], error: null };
    } catch (error) {
      return { locations: [], error };
    }
  }

  // Emergency Contacts
  static async getEmergencyContacts(userId: string): Promise<{ contacts: EmergencyContact[]; error: any }> {
    try {
      const { data: contacts, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      return { contacts: contacts || [], error: null };
    } catch (error) {
      return { contacts: [], error };
    }
  }

  // Route calculation
  static async calculateRoute(
    from: [number, number],
    to: [number, number]
  ): Promise<{ route: any; error: any }> {
    try {
      // This would integrate with Google Directions API or Mapbox Directions API
      // For now, return a mock route
      const distance = Math.sqrt(
        Math.pow(from[0] - to[0], 2) + Math.pow(from[1] - to[1], 2)
      ) * 111; // Rough conversion to km

      const route = {
        distance: distance,
        duration: distance * 60, // Rough estimate: 1km = 1 minute
        polyline: [from, to],
        steps: [
          {
            distance: distance,
            duration: distance * 60,
            instruction: `Head to destination`,
            maneuver: {
              type: 'arrive',
              location: to,
            },
          },
        ],
        summary: {
          totalDistance: distance,
          totalDuration: distance * 60,
          traffic: 'low' as const,
          tolls: false,
          ferries: false,
        },
      };

      return { route, error: null };
    } catch (error) {
      return { route: null, error };
    }
  }
} 