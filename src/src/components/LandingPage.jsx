import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiSun, FiCalendar, FiUsers, FiPlus, FiKey, FiArrowRight } = FiIcons

const LandingPage = () => {
  const navigate = useNavigate()
  const [eventCode, setEventCode] = useState('')

  const handleJoinEvent = (e) => {
    e.preventDefault()
    if (!eventCode.trim()) {
      toast.error('Bitte gib einen Event-Code ein')
      return
    }
    navigate(`/event/${eventCode.trim()}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto"
      >
        <div className="mb-8 md:mb-12">
          <SafeIcon icon={FiSun} className="text-6xl md:text-8xl text-summer-yellow mx-auto mb-4 md:mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-summer-coral to-summer-orange bg-clip-text text-transparent mb-3 md:mb-4">
            EventSeite.com
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
            Perfekt für alle gemeinsamen Events und Feiern
          </p>
        </div>

        {/* Action Buttons - Neues Event erstellen OBEN */}
        <div className="space-y-6 md:space-y-8 mb-10 md:mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-summer-coral to-summer-orange text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <SafeIcon icon={FiPlus} className="text-xl md:text-2xl" />
              Neues Event erstellen
            </button>
          </motion.div>
        </div>

        {/* Event Code Input - UNTEN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-10 md:mb-12 max-w-md mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
            Event beitreten
          </h2>
          <form onSubmit={handleJoinEvent} className="space-y-4">
            <div className="relative">
              <SafeIcon icon={FiKey} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="Event-Code eingeben"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none transition-colors text-lg"
                autoComplete="off"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!eventCode.trim()}
              className="w-full bg-gradient-to-r from-summer-coral to-summer-orange text-white py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Event beitreten</span>
              <SafeIcon icon={FiArrowRight} />
            </motion.button>
          </form>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl p-5 md:p-8 shadow-lg border border-summer-blue/20"
          >
            <SafeIcon icon={FiCalendar} className="text-3xl md:text-4xl text-summer-blue mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Einfache Planung</h3>
            <p className="text-base md:text-lg text-gray-600">Erstelle Events mit modernem Datum- und Zeitpicker</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl p-5 md:p-8 shadow-lg border border-summer-green/20"
          >
            <SafeIcon icon={FiUsers} className="text-3xl md:text-4xl text-summer-green mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Gemeinsam organisieren</h3>
            <p className="text-base md:text-lg text-gray-600">Verwalte Listen und weise Aufgaben zu</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl p-5 md:p-8 shadow-lg border border-summer-orange/20"
          >
            <SafeIcon icon={FiSun} className="text-3xl md:text-4xl text-summer-orange mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Aktivitäten abstimmen</h3>
            <p className="text-base md:text-lg text-gray-600">Stimmt gemeinsam ab, was ihr machen wollt</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg max-w-md mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 md:mb-6">
            So funktioniert's
          </h3>
          <div className="space-y-4 text-left">
            <div className="flex gap-3 items-start">
              <div className="bg-summer-coral rounded-full text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">1</div>
              <p className="text-gray-700">
                Erstelle ein neues Event und füge Datum, Uhrzeit und benötigte Gegenstände hinzu
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-summer-blue rounded-full text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">2</div>
              <p className="text-gray-700">
                Teile den generierten Link mit deinen Freunden und Familie
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-summer-green rounded-full text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">3</div>
              <p className="text-gray-700">
                Jeder kann sehen, was benötigt wird und sich für Gegenstände eintragen
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-summer-orange rounded-full text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">4</div>
              <p className="text-gray-700">
                Stimmt gemeinsam über Aktivitäten ab und plant das perfekte Event
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Footer with copyright */}
      <div className="text-center text-gray-500 py-4 mt-8 text-sm w-full">
        <p>© 2025 by Carlo Krämer</p>
      </div>
    </div>
  )
}

export default LandingPage