import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { formatDate, formatTime } from '../utils/eventUtils'

const { FiCalendar, FiCheck, FiUser, FiThumbsUp, FiUsers, FiChevronDown, FiChevronUp } = FiIcons

const DateVotingSection = ({ eventData, onDateVoteUpdate }) => {
  const [voterName, setVoterName] = useState('')
  const [savedName, setSavedName] = useState(() => {
    // Try to get the voter name from localStorage
    return localStorage.getItem('voterName') || ''
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Set voter name from localStorage if available
    if (savedName) {
      setVoterName(savedName)
    }
  }, [savedName])

  // Get date options and votes from event data
  const proposedDates = eventData?.proposed_dates || []
  const dateVotes = eventData?.event_date_votes || []

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }

  const voteForDate = async (dateId) => {
    if (!voterName.trim()) {
      toast.error('Bitte gib deinen Namen ein')
      return
    }

    // Save voter name to localStorage
    localStorage.setItem('voterName', voterName.trim())
    setSavedName(voterName.trim())

    const existingVote = dateVotes.find(vote =>
      vote.date_id === dateId && vote.voter_name === voterName.trim()
    )

    let updatedVotes
    if (existingVote) {
      // Remove vote if already voted
      updatedVotes = dateVotes.filter(vote =>
        !(vote.date_id === dateId && vote.voter_name === voterName.trim())
      )
      toast.success('Stimme zurückgenommen!')
    } else {
      // Add new vote
      const newVote = {
        id: generateId(),
        date_id: dateId,
        voter_name: voterName.trim(),
        created_at: new Date().toISOString()
      }
      updatedVotes = [...dateVotes, newVote]
      toast.success('Stimme abgegeben!')
    }

    const updatedEventData = {
      ...eventData,
      event_date_votes: updatedVotes
    }

    onDateVoteUpdate(updatedEventData)
  }

  // Sort dates by number of votes (highest first)
  const sortedDates = [...proposedDates].sort((a, b) => {
    const aVotes = dateVotes.filter(vote => vote.date_id === a.id).length
    const bVotes = dateVotes.filter(vote => vote.date_id === b.id).length
    return bVotes - aVotes
  })

  const hasUserVoted = (dateId) => {
    return dateVotes.some(vote =>
      vote.date_id === dateId && vote.voter_name === voterName.trim()
    )
  }

  const getVotersForDate = (dateId) => {
    return dateVotes
      .filter(vote => vote.date_id === dateId)
      .map(vote => vote.voter_name)
  }

  const getVoteCount = (dateId) => {
    return dateVotes.filter(vote => vote.date_id === dateId).length
  }

  // Get summary text for collapsed state
  const getSummaryText = () => {
    if (sortedDates.length === 0) return 'Keine Termine vorgeschlagen'
    
    const topDate = sortedDates[0]
    const topVotes = getVoteCount(topDate.id)
    const dateObj = new Date(topDate.date)
    
    if (topVotes > 0) {
      return `Beliebtester Termin: ${formatDate(dateObj)} (${topVotes} Stimmen)`
    } else {
      return `${sortedDates.length} Termine vorgeschlagen - noch keine Stimmen`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl shadow-lg mb-6"
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
            <SafeIcon icon={FiCalendar} className="text-summer-blue" />
            Terminabstimmung
          </h2>
          <p className="text-sm text-gray-600">
            {getSummaryText()}
          </p>
        </div>
        <SafeIcon 
          icon={isExpanded ? FiChevronUp : FiChevronDown} 
          className="text-2xl text-summer-blue ml-4 flex-shrink-0" 
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
            {/* Voter name input */}
            <div className="mb-5 md:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <SafeIcon icon={FiUser} className="text-summer-coral" />
                <h3 className="text-lg font-semibold">Dein Name für die Abstimmung</h3>
              </div>
              <input
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="Dein Name"
                className="w-full px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-blue focus:outline-none text-base md:text-lg"
              />
            </div>

            {/* Dates list */}
            <div className="space-y-3 md:space-y-4">
              {sortedDates.map((dateOption, index) => {
                const voteCount = getVoteCount(dateOption.id)
                const voters = getVotersForDate(dateOption.id)
                const isVoted = hasUserVoted(dateOption.id)
                const dateObj = new Date(dateOption.date)
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

                return (
                  <motion.div
                    key={dateOption.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-xl border p-4 md:p-5 ${
                      isVoted
                        ? 'bg-gradient-to-r from-summer-blue/20 to-summer-green/20 border-summer-blue/30'
                        : isWeekend
                        ? 'bg-gradient-to-r from-summer-blue/10 to-summer-blue/5 border-summer-blue/20'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          {formatDate(dateObj)}
                          {isWeekend && (
                            <span className="text-xs bg-summer-blue/20 text-summer-blue px-2 py-0.5 rounded-full">
                              Wochenende
                            </span>
                          )}
                        </h3>
                        <p className="text-summer-coral font-medium">
                          {formatTime(dateObj)} Uhr
                        </p>
                        {voters.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <SafeIcon icon={FiUsers} className="text-summer-blue" />
                            <span>
                              {voters.slice(0, 3).join(', ')}
                              {voters.length > 3 ? ` + ${voters.length - 3} weitere` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-summer-blue/10 py-1 px-3 rounded-full flex items-center gap-1">
                          <span className="font-bold text-lg">{voteCount}</span>
                          <span className="text-gray-600 text-sm">
                            {voteCount === 1 ? 'Stimme' : 'Stimmen'}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => voteForDate(dateOption.id)}
                          disabled={!voterName.trim()}
                          className={`px-3 py-2 rounded-full font-semibold flex items-center gap-2 ${
                            !voterName.trim()
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isVoted
                              ? 'bg-summer-green text-white'
                              : 'bg-summer-blue text-white'
                          }`}
                        >
                          {isVoted ? (
                            <>
                              <SafeIcon icon={FiCheck} />
                              <span>Gewählt</span>
                            </>
                          ) : (
                            <>
                              <SafeIcon icon={FiThumbsUp} />
                              <span>Wählen</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {proposedDates.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <SafeIcon icon={FiCalendar} className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Keine Termine vorgeschlagen
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-summer-blue/10 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Terminabstimmung:</h4>
              <p className="text-sm text-gray-600">
                Stimme für die Termine ab, an denen du Zeit hast. Der beliebteste Termin wird automatisch für das Event übernommen. Du kannst deine Stimme jederzeit wieder zurücknehmen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default DateVotingSection