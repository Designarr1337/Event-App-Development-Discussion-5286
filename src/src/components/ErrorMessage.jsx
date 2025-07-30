import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertCircle, FiHome } = FiIcons

const ErrorMessage = ({ title = "Fehler aufgetreten", message, showHomeButton = true, onRetry, onHome }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-md mx-auto"
    >
      <SafeIcon icon={FiAlertCircle} className="text-6xl text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{message}</p>
      
      <div className="flex gap-4 justify-center">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="bg-summer-coral text-white px-6 py-3 rounded-full font-semibold"
          >
            Erneut versuchen
          </motion.button>
        )}
        {showHomeButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onHome || (() => window.location.href = '/')}
            className="bg-summer-blue text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2"
          >
            <SafeIcon icon={FiHome} />
            Zur Startseite
          </motion.button>
        )}
      </div>
      
      {/* Footer with copyright */}
      <div className="text-center text-gray-500 py-4 mt-8 text-sm">
        <p>© 2025 by Carlo Krämer</p>
      </div>
    </motion.div>
  )
}

export default ErrorMessage