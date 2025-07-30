import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheck, FiClock, FiRefreshCw, FiAlertCircle } = FiIcons

/**
 * Component to display the current synchronization status
 * 
 * @param {Object} props Component props
 * @param {string} props.status The current sync status ('idle', 'syncing', 'success', 'error')
 * @param {Date} props.lastSyncTime The timestamp of the last successful sync
 * @param {boolean} props.isAutoSyncEnabled Whether automatic syncing is enabled
 * @param {Function} props.onSync Callback function when manual sync button is clicked
 * @param {Function} props.onToggleAutoSync Callback function to toggle auto-sync
 * @param {boolean} props.compact Whether to display in compact mode
 */
const SyncStatusIndicator = ({
  status,
  lastSyncTime,
  isAutoSyncEnabled,
  onSync,
  onToggleAutoSync,
  compact = false
}) => {
  // Format the last sync time
  const formattedTime = lastSyncTime?.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) || '--:--:--'

  // Determine icon and color based on status
  const getStatusInfo = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: FiClock,
          color: 'bg-summer-yellow/50 text-summer-orange',
          text: 'Synchronisiere...',
          animate: true
        }
      case 'success':
        return {
          icon: FiCheck,
          color: 'bg-summer-green/20 text-summer-green',
          text: 'Aktualisiert!',
          animate: false
        }
      case 'error':
        return {
          icon: FiAlertCircle,
          color: 'bg-red-100 text-red-500',
          text: 'Fehler',
          animate: false
        }
      default: // idle
        return {
          icon: FiRefreshCw,
          color: 'bg-gray-100 text-gray-500',
          text: 'Bereit',
          animate: false
        }
    }
  }

  const statusInfo = getStatusInfo()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span 
          className={`w-2 h-2 rounded-full ${
            status === 'syncing' ? 'bg-summer-yellow animate-pulse' : 
            status === 'success' ? 'bg-summer-green' : 
            status === 'error' ? 'bg-red-500' : 
            'bg-gray-400'
          }`}
        />
        <span className="text-xs text-gray-500">
          {status === 'syncing' 
            ? 'Synchronisiere...' 
            : isAutoSyncEnabled 
              ? 'Auto-Sync aktiv' 
              : 'Auto-Sync inaktiv'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-full ${statusInfo.color}`}>
          <SafeIcon 
            icon={statusInfo.icon} 
            className={statusInfo.animate ? "animate-spin" : ""}
          />
        </div>
        <span className="text-sm font-medium">{statusInfo.text}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSync}
          disabled={status === 'syncing'}
          className="ml-2 bg-summer-blue/20 hover:bg-summer-blue/30 text-summer-blue p-1 rounded-full disabled:opacity-50"
        >
          <SafeIcon icon={FiRefreshCw} className="text-sm" />
        </motion.button>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-500">
          Letzte Aktualisierung: {formattedTime}
        </div>
        <button 
          onClick={onToggleAutoSync}
          className={`px-2 py-0.5 rounded-full text-xs ${
            isAutoSyncEnabled 
              ? 'bg-summer-green/20 text-summer-green' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isAutoSyncEnabled ? 'Auto-Sync AN' : 'Auto-Sync AUS'}
        </button>
      </div>
    </div>
  )
}

export default SyncStatusIndicator