/**
 * Enhanced URL Compression Service
 * 
 * This service provides utilities for creating much shorter URLs
 * by using more aggressive compression techniques and shorter IDs
 */

// Ultra-compact character set (alphanumeric only, no confusing characters)
const COMPACT_CHARS = '0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz' // 58 chars, no 0/O, I/l confusion

// Convert number to ultra-compact base58 string
export const toCompact = (num) => {
  if (num === 0) return COMPACT_CHARS[0]
  let result = ''
  let n = num
  while (n > 0) {
    result = COMPACT_CHARS[n % 58] + result
    n = Math.floor(n / 58)
  }
  return result
}

// Convert compact string to number
export const fromCompact = (str) => {
  let result = 0
  for (let i = 0; i < str.length; i++) {
    result = result * 58 + COMPACT_CHARS.indexOf(str[i])
  }
  return result
}

// Generate ultra-short unique ID
export const generateShortId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000) // Smaller random range
  // Combine and compress more aggressively
  return toCompact(timestamp).slice(-4) + toCompact(random) // Much shorter
}

// Ultra-aggressive object compression
export const compressObject = (obj) => {
  if (!obj) return null

  // Ultra-short key mapping
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
    'item_id': 'k',
    'event_id': 'l',
    'person_name': 'm',
    'votes': 'n',
    'voters': 'o'
  }

  const compressSingle = (item) => {
    const result = {}
    for (const key in item) {
      if (item[key] !== null && item[key] !== undefined && item[key] !== '' && item[key] !== 0) {
        const shortKey = keyMap[key] || key.charAt(0) // Use first character if not mapped
        if (Array.isArray(item[key])) {
          if (item[key].length > 0) { // Only include non-empty arrays
            result[shortKey] = item[key].map(compressSingle)
          }
        } else if (typeof item[key] === 'object' && item[key] !== null) {
          const compressed = compressSingle(item[key])
          if (Object.keys(compressed).length > 0) { // Only include non-empty objects
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

// Decompress object
export const decompressObject = (obj) => {
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
    'k': 'item_id',
    'l': 'event_id',
    'm': 'person_name',
    'n': 'votes',
    'o': 'voters'
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
  
  // Ensure arrays exist at root level
  if (!decompressed.event_items_ev2025) decompressed.event_items_ev2025 = []
  if (!decompressed.event_assignments_ev2025) decompressed.event_assignments_ev2025 = []
  if (!decompressed.event_activities_ev2025) decompressed.event_activities_ev2025 = []
  
  return decompressed
}

// Custom compression using simple encoding
const simpleCompress = (str) => {
  // Remove common patterns and use abbreviations
  return str
    .replace(/event_/g, 'e')
    .replace(/created_at/g, 'ca')
    .replace(/expires_at/g, 'ea')
    .replace(/password_hash/g, 'ph')
    .replace(/person_name/g, 'pn')
    .replace(/":/g, ':')
    .replace(/,"/g, ',"')
    .replace(/\s+/g, '') // Remove all whitespace
}

const simpleDecompress = (str) => {
  // Reverse the compression
  return str
    .replace(/\be/g, 'event_')
    .replace(/\bca/g, 'created_at')
    .replace(/\bea/g, 'expires_at')
    .replace(/\bph/g, 'password_hash')
    .replace(/\bpn/g, 'person_name')
}

// Ultra-compressed event data for URL storage
export const compressEventData = (data) => {
  if (!data) return ''
  
  try {
    // First compress the object structure
    const compressedObj = compressObject(data)
    
    // Convert to JSON and apply simple compression
    const jsonString = JSON.stringify(compressedObj)
    const compressed = simpleCompress(jsonString)
    
    // Use base64 encoding for URL safety (shorter than URI encoding)
    return btoa(compressed)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '') // Remove padding
  } catch (error) {
    console.error('Compression error:', error)
    return ''
  }
}

// Decompress event data from URL
export const decompressEventData = (compressedData) => {
  try {
    if (!compressedData) return null
    
    // Restore base64 padding and decode
    let padded = compressedData
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Add padding if needed
    while (padded.length % 4) {
      padded += '='
    }
    
    const decodedString = atob(padded)
    const decompressed = simpleDecompress(decodedString)
    const parsedObj = JSON.parse(decompressed)
    
    return decompressObject(parsedObj)
  } catch (error) {
    console.error('Decompression error:', error)
    return null
  }
}

// Create shorter event path parameter
export const createShortEventParam = (eventData) => {
  return `${eventData.event_code}`
}

// Create much shorter data parameter
export const createShortDataParam = (eventData) => {
  return compressEventData(eventData)
}

// Extract event code from path
export const extractEventCodeFromPath = (path) => {
  const parts = path.split('/')
  return parts[parts.length - 1]
}