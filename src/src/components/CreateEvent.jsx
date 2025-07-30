import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import DateTimePicker from './DateTimePicker'
import MultiDatePicker from './MultiDatePicker'
import LoadingSpinner from './LoadingSpinner'
import { eventService } from '../utils/urlStorageService'

const { FiArrowLeft, FiSave, FiCalendar } = FiIcons

const CreateEvent = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [eventName, setEventName] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const pageTopRef = useRef(null)

  // Scroll to top when step changes or component mounts
  useEffect(() => {
    const scrollToTop = () => {
      // Try multiple methods to ensure scrolling works
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      // Fallback scroll methods
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Delay to ensure component is fully rendered
    const timeoutId = setTimeout(scrollToTop, 100)
    return () => clearTimeout(timeoutId)
  }, [step]) // Trigger when step changes

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (eventName.trim()) {
      setStep(2)
    }
  }

  const handleDateTimeSubmit = async () => {
    setIsCreating(true)
    try {
      const result = await eventService.createEvent({
        name: eventName,
        date: selectedDate,
        isMultiDay: isMultiDay,
        proposedDates: isMultiDay ? selectedDates : [],
        password: '' // No password needed
      })

      if (result.success) {
        toast.success('Event erfolgreich erstellt!')
        // Get the data parameter from the result URL
        const dataParam = result.url.split('data=')[1]
        // Navigate to event with URL data - use a slight delay to ensure smooth transition
        setTimeout(() => {
          // Use absolute URL with hash router format
          navigate(`/event/${result.data.event_code}?data=${dataParam}`)
        }, 500)
      } else {
        toast.error(`Fehler beim Erstellen: ${result.error}`)
      }
    } catch (error) {
      toast.error('Unerwarteter Fehler aufgetreten')
    } finally {
      setIsCreating(false)
    }
  }

  const goBack = () => {
    if (step === 1) {
      navigate('/')
    } else {
      setStep(step - 1)
    }
  }

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSpinner message="Event wird erstellt..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4 md:py-8">
      {/* Invisible anchor for scrolling to top */}
      <div ref={pageTopRef} className="absolute top-0" />

      <div className="max-w-2xl mx-auto">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={goBack}
          className="flex items-center gap-2 text-summer-blue hover:text-summer-coral mb-6 md:mb-8 text-lg"
        >
          <SafeIcon icon={FiArrowLeft} />
          Zurück
        </motion.button>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {/* Step 1: Event Name */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">
                Wie soll dein Event heißen?
              </h1>

              <form onSubmit={handleNameSubmit} className="space-y-6">
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="z.B. Sommerfest im Garten"
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-2xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none transition-colors"
                  autoFocus
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!eventName.trim()}
                  className="w-full bg-gradient-to-r from-summer-coral to-summer-orange text-white py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Weiter
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Date & Time (was previously Step 3) */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">
                Wann findet "{eventName}" statt?
              </h1>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">Wähle Datum und Uhrzeit</p>

              {/* Toggle between single day and multiple days */}
              <div className="bg-gray-100 rounded-xl p-3 mb-5 md:mb-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsMultiDay(false)}
                    className={`px-4 py-2 rounded-l-xl font-medium ${
                      !isMultiDay ? 'bg-summer-blue text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SafeIcon icon={FiCalendar} />
                      <span>Fester Termin</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsMultiDay(true)}
                    className={`px-4 py-2 rounded-r-xl font-medium ${
                      isMultiDay ? 'bg-summer-coral text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SafeIcon icon={FiCalendar} />
                      <span>Mehrere Termine</span>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isMultiDay
                    ? 'Teilnehmer können für verschiedene Termine abstimmen'
                    : 'Der Termin steht bereits fest'}
                </p>
              </div>

              {isMultiDay ? (
                <MultiDatePicker
                  selectedDates={selectedDates}
                  onDatesChange={setSelectedDates}
                  mainDate={selectedDate}
                  onMainDateChange={setSelectedDate}
                />
              ) : (
                <DateTimePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              )}

              <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold"
                >
                  Zurück
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDateTimeSubmit}
                  disabled={isMultiDay && selectedDates.length === 0}
                  className="flex-1 bg-gradient-to-r from-summer-coral to-summer-orange text-white py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiSave} />
                  Event erstellen
                </motion.button>
              </div>

              {isMultiDay && (
                <p className="text-sm text-gray-500 mt-4">
                  {selectedDates.length === 0
                    ? 'Bitte wähle mindestens einen Termin aus'
                    : `${selectedDates.length} Termine zur Auswahl vorgeschlagen`}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer with copyright */}
        <div className="text-center text-gray-500 py-4 mt-8 text-sm">
          <p>© 2025 by Carlo Krämer</p>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent