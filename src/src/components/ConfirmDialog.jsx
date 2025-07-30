import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiX, FiCheck, FiInfo } = FiIcons

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Bestätigen", 
  message = "Bist du sicher?", 
  confirmText = "Bestätigen", 
  cancelText = "Abbrechen",
  type = "warning" // warning, info, success
}) => {
  if (!isOpen) return null
  
  // Determine colors based on type
  const getColors = () => {
    switch (type) {
      case "warning":
        return { 
          icon: FiAlertTriangle, 
          iconColor: "text-red-500", 
          buttonBg: "bg-red-500 hover:bg-red-600",
          bgColor: "bg-red-50"
        }
      case "success":
        return { 
          icon: FiCheck, 
          iconColor: "text-green-500", 
          buttonBg: "bg-green-500 hover:bg-green-600",
          bgColor: "bg-green-50" 
        }
      case "info":
        return { 
          icon: FiInfo, 
          iconColor: "text-blue-500", 
          buttonBg: "bg-blue-500 hover:bg-blue-600",
          bgColor: "bg-blue-50"
        }
      default:
        return { 
          icon: FiAlertTriangle, 
          iconColor: "text-red-500", 
          buttonBg: "bg-red-500 hover:bg-red-600",
          bgColor: "bg-red-50" 
        }
    }
  }
  
  const colors = getColors()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md z-10 overflow-hidden"
        >
          <div className="relative">
            <div className={`${colors.bgColor} px-6 py-4 flex items-start gap-4`}>
              <div className={`${colors.iconColor} mt-1`}>
                <SafeIcon icon={colors.icon} className="text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>
            
            <div className="p-4 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg ${colors.buttonBg} text-white font-medium`}
              >
                {confirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmDialog