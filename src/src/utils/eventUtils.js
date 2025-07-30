// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Format time for display
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Check if event is expired
export const isEventExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};