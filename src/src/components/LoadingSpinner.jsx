import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ message = "Lädt..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        className="w-12 h-12 border-4 border-summer-yellow border-t-summer-coral rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
      
      {/* Footer with copyright */}
      <div className="text-center text-gray-500 py-4 mt-8 text-sm">
        <p>© 2025 by Carlo Krämer</p>
      </div>
    </div>
  )
}

export default LoadingSpinner