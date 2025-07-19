import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeCallbacks {
  onSOSEvent?: (payload: any) => void;
  onHelper?: (payload: any) => void;
  onResponder?: (payload: any) => void;
  onHospital?: (payload: any) => void;
  onMedia?: (payload: any) => void;
  onUser?: (payload: any) => void;
  onLocation?: (payload: any) => void;
}

export class RealtimeService {
  private channels: RealtimeChannel[] = [];
  private callbacks: RealtimeCallbacks = {};

  subscribeToAll(callbacks: RealtimeCallbacks) {
    this.callbacks = callbacks;

    // Subscribe to SOS events
    const sosChannel = supabase
      .channel('sos_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_events',
        },
        (payload) => {
          console.log('SOS Event change:', payload);
          this.callbacks.onSOSEvent?.(payload);
        }
      )
      .subscribe();

    // Subscribe to helpers
    const helperChannel = supabase
      .channel('helpers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'helpers',
        },
        (payload) => {
          console.log('Helper change:', payload);
          this.callbacks.onHelper?.(payload);
        }
      )
      .subscribe();

    // Subscribe to responders
    const responderChannel = supabase
      .channel('responders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'responders',
        },
        (payload) => {
          console.log('Responder change:', payload);
          this.callbacks.onResponder?.(payload);
        }
      )
      .subscribe();

    // Subscribe to hospitals
    const hospitalChannel = supabase
      .channel('hospitals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hospitals',
        },
        (payload) => {
          console.log('Hospital change:', payload);
          this.callbacks.onHospital?.(payload);
        }
      )
      .subscribe();

    // Subscribe to media
    const mediaChannel = supabase
      .channel('media_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
        },
        (payload) => {
          console.log('Media change:', payload);
          this.callbacks.onMedia?.(payload);
        }
      )
      .subscribe();

    // Subscribe to users
    const userChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('User change:', payload);
          this.callbacks.onUser?.(payload);
        }
      )
      .subscribe();

    // Subscribe to locations
    const locationChannel = supabase
      .channel('locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          console.log('Location change:', payload);
          this.callbacks.onLocation?.(payload);
        }
      )
      .subscribe();

    this.channels = [
      sosChannel,
      helperChannel,
      responderChannel,
      hospitalChannel,
      mediaChannel,
      userChannel,
      locationChannel,
    ];
  }

  subscribeToSOSEvents(callback: (payload: any) => void) {
    const channel = supabase
      .channel('sos_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_events',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToHelpers(callback: (payload: any) => void) {
    const channel = supabase
      .channel('helpers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'helpers',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToResponders(callback: (payload: any) => void) {
    const channel = supabase
      .channel('responders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'responders',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToHospitals(callback: (payload: any) => void) {
    const channel = supabase
      .channel('hospitals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hospitals',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToMedia(callback: (payload: any) => void) {
    const channel = supabase
      .channel('media_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToUsers(callback: (payload: any) => void) {
    const channel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  subscribeToLocations(callback: (payload: any) => void) {
    const channel = supabase
      .channel('locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to specific SOS event
  subscribeToSOSEvent(sosEventId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`sos_event_${sosEventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_events',
          filter: `id=eq.${sosEventId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to specific helper
  subscribeToHelper(helperId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`helper_${helperId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'helpers',
          filter: `id=eq.${helperId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to specific responder
  subscribeToResponder(responderId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`responder_${responderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'responders',
          filter: `id=eq.${responderId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to specific user
  subscribeToUser(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to user locations
  subscribeToUserLocations(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`user_locations_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Subscribe to media for specific SOS event
  subscribeToSOSEventMedia(sosEventId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`sos_event_media_${sosEventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
          filter: `sos_event_id=eq.${sosEventId}`,
        },
        callback
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // Unsubscribe from all channels
  unsubscribe() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels = [];
    this.callbacks = {};
  }

  // Unsubscribe from specific channel
  unsubscribeFromChannel(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
    this.channels = this.channels.filter(ch => ch !== channel);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.channels.length > 0,
      channelCount: this.channels.length,
    };
  }

  // Send message to specific channel (for admin notifications)
  sendMessage(channelName: string, message: any) {
    const channel = supabase.channel(channelName);
    return channel.send({
      type: 'broadcast',
      event: 'admin_message',
      payload: message,
    });
  }

  // Subscribe to admin messages
  subscribeToAdminMessages(callback: (message: any) => void) {
    const channel = supabase
      .channel('admin_messages')
      .on('broadcast', { event: 'admin_message' }, callback)
      .subscribe();

    this.channels.push(channel);
    return channel;
  }
} 