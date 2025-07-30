import supabase from '../lib/supabase'

// Generate a unique event code
export const generateEventCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const eventService = {
  // Create new event
  async createEvent(eventData) {
    try {
      const eventCode = generateEventCode()
      
      // Set expiration date to 1 year from now
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      
      const { data, error } = await supabase
        .from('events_ev2025')
        .insert([{
          event_code: eventCode,
          name: eventData.name,
          event_date: eventData.date.toISOString(),
          password_hash: eventData.password || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        data: { ...data, event_code: eventCode }
      }
    } catch (error) {
      console.error('Error creating event:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Get event by code
  async getEventByCode(eventCode) {
    try {
      const { data, error } = await supabase
        .from('events_ev2025')
        .select(`
          *,
          event_items_ev2025(*),
          event_assignments_ev2025(*)
        `)
        .eq('event_code', eventCode)
        .single()
      
      if (error) throw error
      
      // Check if event is expired
      if (new Date() > new Date(data.expires_at)) {
        return {
          success: false,
          error: 'Event ist abgelaufen'
        }
      }
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error getting event:', error)
      return {
        success: false,
        error: error.message || 'Event nicht gefunden'
      }
    }
  },
  
  // Add item to event
  async addItem(eventId, itemName) {
    try {
      const { data, error } = await supabase
        .from('event_items_ev2025')
        .insert([{
          event_id: eventId,
          name: itemName,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error adding item:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Remove item from event
  async removeItem(itemId) {
    try {
      // First remove any assignments for this item
      await supabase
        .from('event_assignments_ev2025')
        .delete()
        .eq('item_id', itemId)
      
      // Then remove the item
      const { error } = await supabase
        .from('event_items_ev2025')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removing item:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Assign item to person
  async assignItem(itemId, personName) {
    try {
      const { data, error } = await supabase
        .from('event_assignments_ev2025')
        .upsert([{
          item_id: itemId,
          person_name: personName,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error assigning item:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Remove assignment
  async removeAssignment(itemId) {
    try {
      const { error } = await supabase
        .from('event_assignments_ev2025')
        .delete()
        .eq('item_id', itemId)
      
      if (error) throw error
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Check if event exists by code
  async checkEventExists(eventCode) {
    try {
      const { data, error } = await supabase
        .from('events_ev2025')
        .select('id, name')
        .eq('event_code', eventCode)
        .single()
      
      if (error) {
        return {
          success: false,
          exists: false
        }
      }
      
      return {
        success: true,
        exists: true,
        name: data.name
      }
    } catch (error) {
      console.error('Error checking event:', error)
      return {
        success: false,
        exists: false
      }
    }
  }
}

// Verify password
export const verifyPassword = async (providedPassword, storedPassword) => {
  // Simple comparison for now
  return providedPassword === storedPassword;
}