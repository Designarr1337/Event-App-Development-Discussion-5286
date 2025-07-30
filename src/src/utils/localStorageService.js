/** 
 * Local Storage Service for Event Management
 * Handles all data persistence without requiring a backend
 */

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate a unique event code
const generateEventCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get all events from localStorage
const getEvents = () => {
  try {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : {};
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return {};
  }
};

// Save events to localStorage
const saveEvents = (events) => {
  try {
    localStorage.setItem('events', JSON.stringify(events));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Event Service using localStorage
export const eventService = {
  // Create a new event
  createEvent: async ({ name, date, password = '' }) => {
    try {
      const events = getEvents();
      const eventCode = generateEventCode();
      const eventId = generateId();

      // Set expiration date to 1 year from now
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const newEvent = {
        id: eventId,
        event_code: eventCode,
        name,
        event_date: date.toISOString(),
        password_hash: password || null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        event_items_ev2025: [],
        event_assignments_ev2025: [],
        event_activities_ev2025: []
      };

      events[eventCode] = newEvent;
      saveEvents(events);

      return {
        success: true,
        data: newEvent,
        url: `/event/${eventCode}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get event by code
  getEventByCode: async (eventCode) => {
    try {
      const events = getEvents();
      const event = events[eventCode];
      
      if (!event) {
        return {
          success: false,
          error: 'Event nicht gefunden'
        };
      }

      // Check if event is expired
      if (new Date() > new Date(event.expires_at)) {
        return {
          success: false,
          error: 'Event ist abgelaufen'
        };
      }

      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Add item to event
  addItem: async (eventId, itemName) => {
    try {
      const events = getEvents();
      
      // Find the event by eventId
      let targetEventCode = null;
      for (const code in events) {
        if (events[code].id === eventId) {
          targetEventCode = code;
          break;
        }
      }

      if (!targetEventCode) {
        return {
          success: false,
          error: 'Event nicht gefunden'
        };
      }

      const newItem = {
        id: generateId(),
        event_id: eventId,
        name: itemName,
        created_at: new Date().toISOString()
      };

      events[targetEventCode].event_items_ev2025.push(newItem);
      saveEvents(events);

      return {
        success: true,
        data: newItem
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Remove item from event
  removeItem: async (itemId) => {
    try {
      const events = getEvents();
      
      // Find the event containing the item
      for (const code in events) {
        const event = events[code];
        const itemIndex = event.event_items_ev2025.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
          // Remove item
          event.event_items_ev2025.splice(itemIndex, 1);
          
          // Remove any assignments for this item
          event.event_assignments_ev2025 = event.event_assignments_ev2025.filter(
            assignment => assignment.item_id !== itemId
          );
          
          saveEvents(events);
          return {
            success: true
          };
        }
      }
      
      return {
        success: false,
        error: 'Item nicht gefunden'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Assign item to person
  assignItem: async (itemId, personName) => {
    try {
      const events = getEvents();
      
      // Find the event containing the item
      for (const code in events) {
        const event = events[code];
        const itemExists = event.event_items_ev2025.some(item => item.id === itemId);
        
        if (itemExists) {
          // Remove existing assignment if any
          event.event_assignments_ev2025 = event.event_assignments_ev2025.filter(
            assignment => assignment.item_id !== itemId
          );
          
          // Create new assignment
          const newAssignment = {
            id: generateId(),
            item_id: itemId,
            person_name: personName,
            created_at: new Date().toISOString()
          };
          
          event.event_assignments_ev2025.push(newAssignment);
          saveEvents(events);
          
          return {
            success: true,
            data: newAssignment
          };
        }
      }
      
      return {
        success: false,
        error: 'Item nicht gefunden'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Remove assignment
  removeAssignment: async (itemId) => {
    try {
      const events = getEvents();
      
      // Find the event containing the assignment
      for (const code in events) {
        const event = events[code];
        const assignmentIndex = event.event_assignments_ev2025.findIndex(
          assignment => assignment.item_id === itemId
        );
        
        if (assignmentIndex !== -1) {
          // Remove assignment
          event.event_assignments_ev2025.splice(assignmentIndex, 1);
          saveEvents(events);
          
          return {
            success: true
          };
        }
      }
      
      return {
        success: false,
        error: 'Zuweisung nicht gefunden'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if event exists by code
  checkEventExists: async (eventCode) => {
    try {
      const events = getEvents();
      const event = events[eventCode];
      
      if (!event) {
        return {
          success: false,
          exists: false
        };
      }
      
      return {
        success: true,
        exists: true,
        name: event.name
      };
    } catch (error) {
      return {
        success: false,
        exists: false
      };
    }
  },

  // Get all events
  getAllEvents: async () => {
    try {
      const events = getEvents();
      const eventArray = Object.values(events);
      
      return {
        success: true,
        data: eventArray
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// TTL service for event expiration
export const ttlService = {
  // Get time remaining until expiration
  getTimeRemaining: (eventData) => {
    try {
      if (!eventData || !eventData.expires_at) {
        return {
          success: false,
          error: 'Event data missing'
        };
      }
      
      const now = new Date();
      const expiresAt = new Date(eventData.expires_at);
      const timeRemaining = expiresAt - now;
      
      // Convert to days
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      
      return {
        success: true,
        daysRemaining,
        expiresAt: eventData.expires_at
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if an event is expired
  isEventExpired: (eventData) => {
    try {
      if (!eventData || !eventData.expires_at) {
        return {
          success: false,
          error: 'Event data missing'
        };
      }
      
      const now = new Date();
      const expiresAt = new Date(eventData.expires_at);
      
      return {
        success: true,
        isExpired: expiresAt < now
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Clean up expired events
  cleanupExpiredEvents: async () => {
    try {
      const events = getEvents();
      const now = new Date();
      let expiredCount = 0;
      
      for (const code in events) {
        const event = events[code];
        const expiresAt = new Date(event.expires_at);
        
        if (expiresAt < now) {
          delete events[code];
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        saveEvents(events);
      }
      
      return {
        success: true,
        count: expiredCount,
        message: `Deleted ${expiredCount} expired events`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Verify password (simple check for localStorage)
export const verifyPassword = async (providedPassword, storedPassword) => {
  return providedPassword === storedPassword;
};