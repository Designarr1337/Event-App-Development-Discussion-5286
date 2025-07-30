import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { formatDate, formatTime } from '../utils/eventUtils'

const { FiFlag, FiCheck, FiAlertTriangle, FiHeart, FiChevronDown, FiChevronUp, FiCalendar } = FiIcons

const EventSummary = ({ activities, items, assignments, dateVotes = [], proposedDates = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Sort activities by votes (highest first)
  const sortedActivities = [...activities].sort((a, b) => (b.votes || 0) - (a.votes || 0))

  // Sort dates by votes if available
  const sortedDates = proposedDates.length > 0 ? 
    [...proposedDates].sort((a, b) => {
      const aVotes = dateVotes.filter(vote => vote.date_id === a.id).length
      const bVotes = dateVotes.filter(vote => vote.date_id === b.id).length
      return bVotes - aVotes
    }) : []

  // Count missing assignments
  const missingCount = items.length - assignments.length

  // Get top activity
  const topActivity = sortedActivities.length > 0 ? sortedActivities[0] : null

  // Get top date
  const topDate = sortedDates.length > 0 ? sortedDates[0] : null
  const topDateVotes = topDate ? dateVotes.filter(vote => vote.date_id === topDate.id).length : 0

  // Get missing items
  const assignedItemIds = assignments.map(assignment => assignment.item_id)
  const missingItems = items.filter(item => !assignedItemIds.includes(item.id))

  // Create summary text for collapsed state
  const getSummaryText = () => {
    const parts = []
    
    if (topActivity) {
      parts.push(`Beliebteste Aktivität: ${topActivity.name} (${topActivity.votes || 0} Stimmen)`)
    }
    
    if (topDate) {
      const dateObj = new Date(topDate.date)
      parts.push(`Beliebtester Termin: ${formatDate(dateObj)} (${topDateVotes} Stimmen)`)
    }
    
    parts.push(`Mitbringsel: ${assignments.length} von ${items.length} zugewiesen`)
    
    if (missingCount > 0) {
      parts.push(`${missingCount} fehlen noch`)
    } else if (items.length > 0) {
      parts.push('Alle zugewiesen!')
    }
    
    return parts.join(' • ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-summer-yellow/20 to-summer-orange/20 rounded-3xl shadow-lg mb-6"
    >
      {/* Accordion Header */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 md:p-6 text-left flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <SafeIcon icon={FiFlag} className="text-summer-orange" />
            Event-Zusammenfassung
          </h2>
          <p className="text-sm text-gray-600">
            {getSummaryText()}
          </p>
        </div>
        <SafeIcon 
          icon={isExpanded ? FiChevronUp : FiChevronDown} 
          className="text-2xl text-summer-orange ml-4 flex-shrink-0"
        />
      </motion.button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 md:px-6 pb-5 md:pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <SafeIcon icon={FiHeart} className="text-summer-coral" />
                    Beliebteste Aktivität
                  </h3>
                  {topActivity ? (
                    <div className="bg-white rounded-lg p-3 mt-2">
                      <p className="font-medium text-gray-800">{topActivity.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {topActivity.votes || 0} {(topActivity.votes || 0) === 1 ? 'Stimme' : 'Stimmen'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic mt-2">Noch keine Aktivitäten vorgeschlagen</p>
                  )}
                </div>

                {/* Popular date section - only shown if date voting is available */}
                {sortedDates.length > 0 && (
                  <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <SafeIcon icon={FiCalendar} className="text-summer-blue" />
                      Beliebtester Termin
                    </h3>
                    {topDate ? (
                      <div className="bg-white rounded-lg p-3 mt-2">
                        <p className="font-medium text-gray-800">{formatDate(new Date(topDate.date))}</p>
                        <p className="text-summer-coral">{formatTime(new Date(topDate.date))} Uhr</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {topDateVotes} {topDateVotes === 1 ? 'Stimme' : 'Stimmen'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 italic mt-2">Noch keine Termine abgestimmt</p>
                    )}
                  </div>
                )}

                <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-1">Mitbringsel Status</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Übersicht über alle benötigten Gegenstände und deren Zuweisung
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="bg-summer-green/20 rounded-lg p-2 flex items-center gap-2 flex-1">
                      <SafeIcon icon={FiCheck} className="text-summer-green" />
                      <span className="text-sm">{assignments.length} zugewiesen</span>
                    </div>
                    {missingCount > 0 ? (
                      <div className="bg-summer-coral/20 rounded-lg p-2 flex items-center gap-2 flex-1">
                        <SafeIcon icon={FiAlertTriangle} className="text-summer-coral" />
                        <span className="text-sm">{missingCount} fehlen noch</span>
                      </div>
                    ) : items.length > 0 ? (
                      <div className="bg-summer-green/20 rounded-lg p-2 flex items-center gap-2 flex-1">
                        <SafeIcon icon={FiCheck} className="text-summer-green" />
                        <span className="text-sm">Alle zugewiesen!</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 flex-1">
                        <span className="text-sm text-gray-500">Keine Gegenstände</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {missingCount > 0 ? 'Es fehlen noch:' : 'Alles organisiert!'}
                </h3>
                {missingCount > 0 ? (
                  <>
                    <p className="text-xs text-gray-500 mb-3">
                      Diese Gegenstände brauchen noch jemanden, der sie mitbringt:
                    </p>
                    <ul className="space-y-2 max-h-[120px] overflow-y-auto">
                      {missingItems.slice(0, 4).map((item, index) => (
                        <li key={item.id} className="bg-summer-coral/10 rounded-lg p-2 text-sm flex items-center gap-2">
                          <SafeIcon icon={FiAlertTriangle} className="text-summer-coral text-xs" />
                          {item.name}
                        </li>
                      ))}
                      {missingItems.length > 4 && (
                        <li className="text-center text-sm text-gray-500">
                          +{missingItems.length - 4} weitere
                        </li>
                      )}
                    </ul>
                  </>
                ) : items.length > 0 ? (
                  <div className="flex items-center justify-center h-[100px]">
                    <div className="text-center">
                      <SafeIcon icon={FiCheck} className="text-5xl text-summer-green mx-auto mb-2" />
                      <p className="text-gray-700">Super! Alles ist organisiert.</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Alle {items.length} Gegenstände sind zugewiesen
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[100px]">
                    <div className="text-center">
                      <p className="text-gray-500">
                        Füge Gegenstände hinzu, die für dein Event benötigt werden
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dann können sich Teilnehmer dafür eintragen
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Statistics */}
            {(activities.length > 0 || items.length > 0 || sortedDates.length > 0) && (
              <div className="mt-4 p-3 bg-white/40 rounded-xl">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {activities.length > 0 && (
                    <span>📊 {activities.length} Aktivität{activities.length > 1 ? 'en' : ''} vorgeschlagen</span>
                  )}
                  {sortedDates.length > 0 && (
                    <span>📅 {sortedDates.length} Termin{sortedDates.length > 1 ? 'e' : ''} zur Abstimmung</span>
                  )}
                  {items.length > 0 && (
                    <span>📝 {items.length} Gegenstand{items.length > 1 ? 'e' : ''} benötigt</span>
                  )}
                  {assignments.length > 0 && (
                    <span>👥 {new Set(assignments.map(a => a.person_name)).size} Person{new Set(assignments.map(a => a.person_name)).size > 1 ? 'en' : ''} helfen mit</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default EventSummary