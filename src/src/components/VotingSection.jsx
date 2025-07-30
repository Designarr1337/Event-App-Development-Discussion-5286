import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiHeart, FiThumbsUp, FiPlus, FiTrash2 } = FiIcons

const VotingSection = ({ eventData, onVoteUpdate }) => {
  const [newActivity, setNewActivity] = useState('')
  const [voterName, setVoterName] = useState('')
  const [savedName, setSavedName] = useState(() => {
    // Try to get the voter name from localStorage
    return localStorage.getItem('voterName') || ''
  })

  useEffect(() => {
    // Set voter name from localStorage if available
    if (savedName) {
      setVoterName(savedName)
    }
  }, [savedName])

  // Predefined popular activities
  const popularActivities = [
    'Pizza essen gehen', 'Burger essen', 'Grillen', 'Bowling', 'Kino', 'Spazieren gehen',
    'Café besuchen', 'Kochen zusammen', 'Spieleabend', 'Karaoke', 'Minigolf', 'Picknick',
    'Bar-Tour', 'Restaurant besuchen', 'Bier trinken'
  ]

  // Get activities from event data
  const activities = eventData?.event_activities_ev2025 || []

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }

  const addActivity = async (e) => {
    e.preventDefault()
    if (!newActivity.trim()) return

    const newActivityObj = {
      id: generateId(),
      name: newActivity.trim(),
      votes: 0,
      voters: [],
      created_at: new Date().toISOString()
    }

    const updatedEventData = {
      ...eventData,
      event_activities_ev2025: [...activities, newActivityObj]
    }

    onVoteUpdate(updatedEventData)
    setNewActivity('')
    toast.success('Aktivität hinzugefügt')
  }

  const addPopularActivity = async (activityName) => {
    // Check if activity already exists
    if (activities.some(activity => activity.name === activityName)) {
      toast.error('Diese Aktivität wurde bereits hinzugefügt')
      return
    }

    const newActivityObj = {
      id: generateId(),
      name: activityName,
      votes: 0,
      voters: [],
      created_at: new Date().toISOString()
    }

    const updatedEventData = {
      ...eventData,
      event_activities_ev2025: [...activities, newActivityObj]
    }

    onVoteUpdate(updatedEventData)
    toast.success('Aktivität hinzugefügt')
  }

  const removeActivity = async (activityId) => {
    const updatedEventData = {
      ...eventData,
      event_activities_ev2025: activities.filter(activity => activity.id !== activityId)
    }

    onVoteUpdate(updatedEventData)
    toast.success('Aktivität entfernt')
  }

  const voteForActivity = async (activityId) => {
    if (!voterName.trim()) {
      toast.error('Bitte gib deinen Namen ein')
      return
    }

    // Save voter name to localStorage
    localStorage.setItem('voterName', voterName.trim())
    setSavedName(voterName.trim())

    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId) {
        const voters = activity.voters || []
        // Check if user already voted
        if (voters.includes(voterName.trim())) {
          toast.error('Du hast bereits für diese Aktivität gestimmt')
          return activity
        }

        return {
          ...activity,
          votes: (activity.votes || 0) + 1,
          voters: [...voters, voterName.trim()]
        }
      }
      return activity
    })

    const updatedEventData = {
      ...eventData,
      event_activities_ev2025: updatedActivities
    }

    onVoteUpdate(updatedEventData)
    toast.success('Stimme abgegeben!')
  }

  const removeVote = async (activityId) => {
    if (!voterName.trim()) {
      toast.error('Bitte gib deinen Namen ein')
      return
    }

    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId) {
        const voters = activity.voters || []
        // Check if user has voted
        if (!voters.includes(voterName.trim())) {
          toast.error('Du hast noch nicht für diese Aktivität gestimmt')
          return activity
        }

        return {
          ...activity,
          votes: Math.max(0, (activity.votes || 0) - 1),
          voters: voters.filter(voter => voter !== voterName.trim())
        }
      }
      return activity
    })

    const updatedEventData = {
      ...eventData,
      event_activities_ev2025: updatedActivities
    }

    onVoteUpdate(updatedEventData)
    toast.success('Stimme zurückgenommen!')
  }

  // Sort activities by votes (highest first)
  const sortedActivities = [...activities].sort((a, b) => (b.votes || 0) - (a.votes || 0))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-lg mb-6"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 md:mb-6">
        🎯 Was wollen wir machen?
      </h2>

      {/* Popular Activities Quick Add */}
      <div className="mb-5 md:mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Beliebte Aktivitäten:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {popularActivities.slice(0, 8).map((activity, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addPopularActivity(activity)}
              disabled={activities.some(a => a.name === activity)}
              className="bg-gradient-to-r from-summer-orange/20 to-summer-coral/20 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-summer-orange/30 hover:from-summer-orange/30 hover:to-summer-coral/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {activity}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add new activity */}
      <form onSubmit={addActivity} className="mb-5 md:mb-6">
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Eigene Aktivität hinzufügen..."
            className="flex-1 px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-orange focus:outline-none text-base md:text-lg"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-summer-orange text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <SafeIcon icon={FiPlus} />
            <span className="hidden sm:inline">Hinzufügen</span>
          </motion.button>
        </div>
      </form>

      {/* Voter name input */}
      <div className="mb-5 md:mb-6">
        <input
          type="text"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          placeholder="Dein Name für die Abstimmung"
          className="w-full px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none text-base md:text-lg"
        />
      </div>

      {/* Activities list */}
      <div className="space-y-3 md:space-y-4">
        {sortedActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-summer-orange/10 to-summer-coral/10 p-4 md:p-5 rounded-xl border border-summer-orange/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-1">
                {activity.name}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeActivity(activity.id)}
                className="text-red-500 hover:text-red-600 p-1 ml-2"
              >
                <SafeIcon icon={FiTrash2} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiHeart} className="text-summer-coral text-xl" />
                  <span className="text-2xl font-bold text-gray-800">
                    {activity.votes || 0}
                  </span>
                  <span className="text-gray-600">
                    {(activity.votes || 0) === 1 ? 'Stimme' : 'Stimmen'}
                  </span>
                </div>
                {activity.voters && activity.voters.length > 0 && (
                  <div className="text-sm text-gray-500">
                    von: {activity.voters.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => voteForActivity(activity.id)}
                  disabled={!voterName.trim() || (activity.voters || []).includes(voterName.trim())}
                  className="bg-summer-coral text-white px-3 md:px-4 py-2 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <SafeIcon icon={FiThumbsUp} />
                  <span className="hidden sm:inline">
                    {(activity.voters || []).includes(voterName.trim()) ? 'Gestimmt' : 'Stimmen'}
                  </span>
                </motion.button>
                {(activity.voters || []).includes(voterName.trim()) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeVote(activity.id)}
                    className="bg-gray-500 text-white px-3 md:px-4 py-2 rounded-full font-semibold text-sm"
                  >
                    Zurücknehmen
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <SafeIcon icon={FiHeart} className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Noch keine Aktivitäten vorgeschlagen
            </p>
            <p className="text-gray-400 text-base mt-2">
              Wähle aus den beliebten Aktivitäten oder schlage eine eigene vor!
            </p>
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 p-4 bg-summer-yellow/20 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Abstimmungshilfe:</h4>
          <p className="text-sm text-gray-600">
            Jeder kann mit seinem Namen für Aktivitäten stimmen. Die beliebtesten Vorschläge stehen oben. Du kannst deine Stimme auch wieder zurücknehmen.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default VotingSection