/**
 * URL-based Storage Service for Event Management
 * Stores event data directly in the URL for easy sharing and real-time updates
 */

// Ultra-compact character set for URL compression
const COMPACT_CHARS = '0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'

// Convert number to compact base58 string
const toCompact = (num) => {
  if (num === 0) return COMPACT_CHARS[0]
  let result = ''
  let n = num
  while (n > 0) {
    result = COMPACT_CHARS[n % 58] + result
    n = Math.floor(n / 58)
  }
  return result
}

// Generate unique ID
const generateId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return toCompact(timestamp).slice(-4) + toCompact(random)
}

// Generate event code
const generateEventCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Compress object for URL storage
const compressObject = (obj) => {
  if (!obj) return null

  const keyMap = {
    'id': 'a',
    'event_code': 'b',
    'name': 'c',
    'event_date': 'd',
    'password_hash': 'e',
    'expires_at': 'f',
    'created_at': 'g',
    'event_items_ev2025': 'h',
    'event_assignments_ev2025': 'i',
    'event_activities_ev2025': 'j',
    'event_date_votes': 'k',
    'proposed_dates': 'l',
    'isMultiDay': 'm',
    'item_id': 'n',
    'event_id': 'o',
    'person_name': 'p',
    'votes': 'q',
    'voters': 'r',
    'date_id': 's',
    'voter_name': 't',
    'date': 'u'
  }

  const compressSingle = (item) => {
    const result = {}
    for (const key in item) {
      if (item[key] !== null && item[key] !== undefined && item[key] !== '' && item[key] !== 0) {
        const shortKey = keyMap[key] || key.charAt(0)
        if (Array.isArray(item[key])) {
          if (item[key].length > 0) {
            result[shortKey] = item[key].map(compressSingle)
          }
        } else if (typeof item[key] === 'object' && item[key] !== null) {
          const compressed = compressSingle(item[key])
          if (Object.keys(compressed).length > 0) {
            result[shortKey] = compressed
          }
        } else {
          result[shortKey] = item[key]
        }
      }
    }
    return result
  }

  return compressSingle(obj)
}

// Decompress object from URL
const decompressObject = (obj) => {
  if (!obj) return null

  const keyMap = {
    'a': 'id',
    'b': 'event_code',
    'c': 'name',
    'd': 'event_date',
    'e': 'password_hash',
    'f': 'expires_at',
    'g': 'created_at',
    'h': 'event_items_ev2025',
    'i': 'event_assignments_ev2025',
    'j': 'event_activities_ev2025',
    'k': 'event_date_votes',
    'l': 'proposed_dates',
    'm': 'isMultiDay',
    'n': 'item_id',
    'o': 'event_id',
    'p': 'person_name',
    'q': 'votes',
    'r': 'voters',
    's': 'date_id',
    't': 'voter_name',
    'u': 'date'
  }

  const decompressSingle = (item) => {
    const result = {}
    for (const key in item) {
      if (item[key] !== null && item[key] !== undefined) {
        const longKey = keyMap[key] || key
        if (Array.isArray(item[key])) {
          result[longKey] = item[key].map(decompressSingle)
        } else if (typeof item[key] === 'object' && item[key] !== null) {
          result[longKey] = decompressSingle(item[key])
        } else {
          result[longKey] = item[key]
        }
      }
    }
    return result
  }

  const decompressed = decompressSingle(obj)

  // Ensure arrays exist
  if (!decompressed.event_items_ev2025) decompressed.event_items_ev2025 = []
  if (!decompressed.event_assignments_ev2025) decompressed.event_assignments_ev2025 = []
  if (!decompressed.event_activities_ev2025) decompressed.event_activities_ev2025 = []
  if (!decompressed.event_date_votes) decompressed.event_date_votes = []
  if (!decompressed.proposed_dates) decompressed.proposed_dates = []

  return decompressed
}

// Compress event data for URL - optimized for shorter URLs
const compressEventData = (data) => {
  if (!data) return ''

  try {
    // First optimize arrays to reduce size
    const optimizedData = { ...data }

    // Only keep necessary fields in arrays
    if (optimizedData.event_items_ev2025) {
      optimizedData.event_items_ev2025 = optimizedData.event_items_ev2025.map(item => ({
        id: item.id,
        name: item.name,
        event_id: item.event_id
      }))
    }

    if (optimizedData.event_assignments_ev2025) {
      optimizedData.event_assignments_ev2025 = optimizedData.event_assignments_ev2025.map(assignment => ({
        id: assignment.id,
        item_id: assignment.item_id,
        person_name: assignment.person_name
      }))
    }

    if (optimizedData.event_activities_ev2025) {
      optimizedData.event_activities_ev2025 = optimizedData.event_activities_ev2025.map(activity => ({
        id: activity.id,
        name: activity.name,
        votes: activity.votes || 0,
        voters: activity.voters || []
      }))
    }

    if (optimizedData.event_date_votes) {
      optimizedData.event_date_votes = optimizedData.event_date_votes.map(vote => ({
        id: vote.id,
        date_id: vote.date_id,
        voter_name: vote.voter_name
      }))
    }

    if (optimizedData.proposed_dates) {
      optimizedData.proposed_dates = optimizedData.proposed_dates.map(dateOption => ({
        id: dateOption.id,
        date: dateOption.date
      }))
    }

    const compressedObj = compressObject(optimizedData)
    const jsonString = JSON.stringify(compressedObj)

    // Use base64 encoding for URL safety
    return btoa(unescape(encodeURIComponent(jsonString)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  } catch (error) {
    console.error('Compression error:', error)
    return ''
  }
}

// Decompress event data from URL
const decompressEventData = (compressedData) => {
  try {
    if (!compressedData) return null

    // Restore base64 padding and decode
    let padded = compressedData
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    while (padded.length % 4) {
      padded += '='
    }

    const decodedString = decodeURIComponent(escape(atob(padded)))
    const parsedObj = JSON.parse(decodedString)
    return decompressObject(parsedObj)
  } catch (error) {
    console.error('Decompression error:', error)
    return null
  }
}

// Event Service using URL storage
export const eventService = {
  // Create a new event
  createEvent: async ({ name, date, password = '', isMultiDay = false, proposedDates = [] }) => {
    try {
      const eventCode = generateEventCode()
      const eventId = generateId()

      // Set expiration date to 1 year from now
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      // Create proposed dates with IDs for multi-day events
      const proposedDatesWithIds = proposedDates.map(date => ({
        id: generateId(),
        date: date.toISOString()
      }))

      const newEvent = {
        id: eventId,
        event_code: eventCode,
        name,
        event_date: date.toISOString(),
        password_hash: null, // No password needed
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        isMultiDay: isMultiDay || false,
        proposed_dates: proposedDatesWithIds,
        event_items_ev2025: [],
        event_assignments_ev2025: [],
        event_activities_ev2025: [],
        event_date_votes: []
      }

      // Store in localStorage for backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventCode] = newEvent
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not store in localStorage:', storageError)
      }

      // Compress event data for URL
      const compressedData = compressEventData(newEvent)

      return {
        success: true,
        data: { ...newEvent, event_code: eventCode },
        url: `/event/${eventCode}?data=${compressedData}`
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get event by code and URL data
  getEventByCode: async (eventCode, urlData = null) => {
    try {
      let eventData = null

      // Try to get from URL data first
      if (urlData) {
        eventData = decompressEventData(urlData)
      }

      // Fallback to localStorage
      if (!eventData) {
        try {
          const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
          eventData = localEvents[eventCode]
        } catch (storageError) {
          console.warn('Could not retrieve from localStorage:', storageError)
        }
      }

      if (!eventData) {
        return { success: false, error: 'Event nicht gefunden' }
      }

      // Check if event is expired
      if (new Date() > new Date(eventData.expires_at)) {
        return { success: false, error: 'Event ist abgelaufen' }
      }

      return { success: true, data: eventData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Add item to event
  addItem: async (eventData, itemName) => {
    try {
      const newItem = {
        id: generateId(),
        event_id: eventData.id,
        name: itemName,
        created_at: new Date().toISOString()
      }

      const updatedEvent = {
        ...eventData,
        event_items_ev2025: [...(eventData.event_items_ev2025 || []), newItem]
      }

      // Update localStorage backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventData.event_code] = updatedEvent
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }

      return { success: true, data: updatedEvent }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Remove item from event
  removeItem: async (eventData, itemId) => {
    try {
      const updatedEvent = {
        ...eventData,
        event_items_ev2025: eventData.event_items_ev2025.filter(item => item.id !== itemId),
        event_assignments_ev2025: eventData.event_assignments_ev2025.filter(
          assignment => assignment.item_id !== itemId
        )
      }

      // Update localStorage backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventData.event_code] = updatedEvent
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }

      return { success: true, data: updatedEvent }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Assign item to person
  assignItem: async (eventData, itemId, personName) => {
    try {
      // Remove existing assignment if any
      const filteredAssignments = eventData.event_assignments_ev2025.filter(
        assignment => assignment.item_id !== itemId
      )

      // Create new assignment
      const newAssignment = {
        id: generateId(),
        item_id: itemId,
        person_name: personName,
        created_at: new Date().toISOString()
      }

      const updatedEvent = {
        ...eventData,
        event_assignments_ev2025: [...filteredAssignments, newAssignment]
      }

      // Update localStorage backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventData.event_code] = updatedEvent
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }

      return { success: true, data: updatedEvent }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Remove assignment
  removeAssignment: async (eventData, itemId) => {
    try {
      const updatedEvent = {
        ...eventData,
        event_assignments_ev2025: eventData.event_assignments_ev2025.filter(
          assignment => assignment.item_id !== itemId
        )
      }

      // Update localStorage backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventData.event_code] = updatedEvent
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }

      return { success: true, data: updatedEvent }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Save event data (to localStorage and generate new URL)
  saveEventData: async (eventData) => {
    try {
      // Save to localStorage for backup
      try {
        const localEvents = JSON.parse(localStorage.getItem('events') || '{}')
        localEvents[eventData.event_code] = eventData
        localStorage.setItem('events', JSON.stringify(localEvents))
      } catch (storageError) {
        console.warn('Could not update localStorage:', storageError)
      }

      // Generate new URL with compressed data
      const compressedData = compressEventData(eventData)
      const hashRoute = `#/event/${eventData.event_code}`
      const newUrl = `${hashRoute}?data=${compressedData}`

      return {
        success: true,
        url: newUrl,
        data: eventData
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Verify password
export const verifyPassword = async (providedPassword, storedPassword) => {
  return providedPassword === storedPassword
}

// TTL service for event expiration
export const ttlService = {
  getTimeRemaining: (eventData) => {
    try {
      if (!eventData || !eventData.expires_at) {
        return { success: false, error: 'Event data missing' }
      }

      const now = new Date()
      const expiresAt = new Date(eventData.expires_at)
      const timeRemaining = expiresAt - now
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))

      return {
        success: true,
        daysRemaining,
        expiresAt: eventData.expires_at
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}