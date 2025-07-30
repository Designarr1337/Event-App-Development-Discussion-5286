import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import { eventService, verifyPassword } from '../utils/localStorageService'

const { FiKey, FiArrowLeft, FiAlertCircle } = FiIcons

const JoinEvent = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [eventCode] = useState(searchParams.get('code') || '')
  const [providedPassword] = useState(searchParams.get('password') || '')
  const [password, setPassword] = useState(providedPassword)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [needsPassword, setNeedsPassword] = useState(false)

  useEffect(() => {
    if (!eventCode) {
      setError('Kein Event-Code angegeben')
      setIsLoading(false)
      return
    }
    loadEvent()
  }, [eventCode])

  const loadEvent = async () => {
    setIsLoading(true)
    setError(null)
    setIsRetrying(false)

    try {
      console.log('Loading event with code:', eventCode)
      const result = await eventService.getEventByCode(eventCode)
      
      if (result.success) {
        const eventData = result.data
        
        // Check if password is required
        if (eventData.password_hash && !providedPassword) {
          setNeedsPassword(true)
          setEvent(eventData)
        } else if (eventData.password_hash && providedPassword) {
          // Verify provided password
          const isValidPassword = await verifyPassword(providedPassword, eventData.password_hash)
          if (isValidPassword) {
            navigate(`/event/${eventCode}`, {
              state: { eventData, isJoined: true }
            })
          } else {
            setError('Falsches Passwort')
          }
        } else {
          // No password required
          navigate(`/event/${eventCode}`, {
            state: { eventData, isJoined: true }
          })
        }
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error loading event:', error)
      setError('Fehler beim Laden des Events')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      toast.error('Bitte Passwort eingeben')
      return
    }
    
    setIsJoining(true)
    
    try {
      const isValidPassword = await verifyPassword(password, event.password_hash)
      if (isValidPassword) {
        navigate(`/event/${eventCode}`, {
          state: { eventData: event, isJoined: true }
        })
      } else {
        toast.error('Falsches Passwort')
      }
    } catch (error) {
      toast.error('Fehler bei der Passwort-Überprüfung')
    } finally {
      setIsJoining(false)
    }
  }

  const retryLoadEvent = async () => {
    setIsRetrying(true)
    
    try {
      // First check if the event exists
      const checkResult = await eventService.checkEventExists(eventCode)
      
      if (checkResult.success && checkResult.exists) {
        // Event exists, try loading again
        loadEvent()
      } else {
        setError(`Event mit Code "${eventCode}" nicht gefunden`)
      }
    } catch (error) {
      console.error('Error checking event:', error)
      setError('Fehler beim Laden des Events')
    } finally {
      setIsRetrying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSpinner message="Event wird geladen..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-md mx-auto"
        >
          <SafeIcon icon={FiAlertCircle} className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event nicht gefunden</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retryLoadEvent}
              disabled={isRetrying}
              className="bg-summer-coral text-white px-6 py-3 rounded-full font-semibold"
            >
              {isRetrying ? 'Versuche erneut...' : 'Erneut versuchen'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-summer-blue text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiArrowLeft} />
              Zur Startseite
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen py-6 px-4 md:py-8">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-summer-blue hover:text-summer-coral mb-6 md:mb-8 text-lg"
          >
            <SafeIcon icon={FiArrowLeft} />
            Zurück zur Startseite
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-8 text-center"
          >
            <SafeIcon icon={FiKey} className="text-6xl text-summer-coral mx-auto mb-6" />
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Event ist passwortgeschützt
            </h1>
            
            <p className="text-gray-600 mb-2 text-lg">
              {event?.name}
            </p>
            
            <p className="text-gray-500 mb-8">
              Event-Code: <span className="font-mono font-bold">{eventCode}</span>
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Event-Passwort eingeben"
                className="w-full px-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none transition-colors"
                autoFocus
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isJoining || !password.trim()}
                className="w-full bg-gradient-to-r from-summer-coral to-summer-orange text-white py-4 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isJoining ? 'Überprüfe Passwort...' : 'Event beitreten'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}

export default JoinEvent