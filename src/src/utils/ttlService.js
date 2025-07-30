import supabase from '../lib/supabase';

// This service handles the TTL (Time-To-Live) functionality for events
export const ttlService = {
  // Check and clean up expired events
  async cleanupExpiredEvents() {
    try {
      const now = new Date().toISOString();
      
      // Find expired events
      const { data: expiredEvents, error: findError } = await supabase
        .from('events_ev2025')
        .select('id')
        .lt('expires_at', now);
      
      if (findError) throw findError;
      
      if (expiredEvents && expiredEvents.length > 0) {
        // Delete expired events (cascade will handle related items and assignments)
        const expiredIds = expiredEvents.map(event => event.id);
        const { error: deleteError } = await supabase
          .from('events_ev2025')
          .delete()
          .in('id', expiredIds);
          
        if (deleteError) throw deleteError;
        
        return {
          success: true,
          count: expiredEvents.length,
          message: `Deleted ${expiredEvents.length} expired events`
        };
      }
      
      return {
        success: true,
        count: 0,
        message: 'No expired events found'
      };
    } catch (error) {
      console.error('Error cleaning up expired events:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Get time remaining until expiration
  async getTimeRemaining(eventCode) {
    try {
      const { data, error } = await supabase
        .from('events_ev2025')
        .select('expires_at')
        .eq('event_code', eventCode)
        .single();
      
      if (error) throw error;
      
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const timeRemaining = expiresAt - now;
      
      // Convert to days
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      
      return {
        success: true,
        daysRemaining,
        expiresAt: data.expires_at
      };
    } catch (error) {
      console.error('Error getting time remaining:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default ttlService;