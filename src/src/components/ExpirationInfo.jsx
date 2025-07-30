import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { ttlService } from '../utils/localStorageService';

const { FiClock, FiAlertTriangle } = FiIcons;

const ExpirationInfo = ({ eventData }) => {
  if (!eventData) return null;

  // Calculate time remaining based on event data
  const calculateTimeRemaining = () => {
    try {
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
      console.error('Error calculating time remaining:', error);
      return { success: false };
    }
  };
  
  const timeRemaining = calculateTimeRemaining();
  if (!timeRemaining.success) return null;

  // Format the expiration date
  const expirationDate = new Date(timeRemaining.expiresAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Determine urgency level
  const isUrgent = timeRemaining.daysRemaining <= 30;
  const isVeryUrgent = timeRemaining.daysRemaining <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
        isVeryUrgent
          ? 'bg-red-50 text-red-700'
          : isUrgent
          ? 'bg-amber-50 text-amber-700'
          : 'bg-gray-50 text-gray-600'
      }`}
    >
      <SafeIcon
        icon={isUrgent ? FiAlertTriangle : FiClock}
        className={isVeryUrgent ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-gray-500'}
      />
      <span>
        {isVeryUrgent
          ? `Daten werden bald gelöscht! Nur noch ${timeRemaining.daysRemaining} Tage bis zum ${expirationDate}`
          : isUrgent
          ? `Event läuft ab am ${expirationDate} (in ${timeRemaining.daysRemaining} Tagen)`
          : `Automatische Löschung am ${expirationDate} (Datenschutz)`}
      </span>
    </motion.div>
  );
};

export default ExpirationInfo;