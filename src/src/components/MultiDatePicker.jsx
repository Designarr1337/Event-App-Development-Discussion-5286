import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiCheck, FiPlus, FiX } = FiIcons

const MultiDatePicker = ({ selectedDates, onDatesChange, mainDate, onMainDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(mainDate.getFullYear(), mainDate.getMonth())
  )
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date(mainDate))
  const [tempSelectedTime, setTempSelectedTime] = useState({
    hours: mainDate.getHours(),
    minutes: mainDate.getMinutes()
  })
  const [showAddButton, setShowAddButton] = useState(false)

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]

  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const selectDate = (date) => {
    // Update the temp selected date
    const newTempDate = new Date(date)
    newTempDate.setHours(tempSelectedTime.hours)
    newTempDate.setMinutes(tempSelectedTime.minutes)
    setTempSelectedDate(newTempDate)
    // Show the add button
    setShowAddButton(true)
  }

  const updateTime = (hours, minutes) => {
    setTempSelectedTime({ hours, minutes })
    // Update the temp selected date with the new time
    const newTempDate = new Date(tempSelectedDate)
    newTempDate.setHours(hours)
    newTempDate.setMinutes(minutes)
    setTempSelectedDate(newTempDate)
    // Show the add button
    setShowAddButton(true)
  }

  const addSelectedDate = () => {
    // Check if this date already exists in the selected dates
    const dateExists = selectedDates.some(date =>
      date.getDate() === tempSelectedDate.getDate() &&
      date.getMonth() === tempSelectedDate.getMonth() &&
      date.getFullYear() === tempSelectedDate.getFullYear() &&
      date.getHours() === tempSelectedDate.getHours() &&
      date.getMinutes() === tempSelectedDate.getMinutes()
    )

    if (!dateExists) {
      const newSelectedDates = [...selectedDates, new Date(tempSelectedDate)]
      onDatesChange(newSelectedDates)
      
      // Update the main date to match the most recently added date
      onMainDateChange(new Date(tempSelectedDate))
      
      // Hide the add button after adding
      setShowAddButton(false)
    }
  }

  const removeDate = (dateToRemove) => {
    const newSelectedDates = selectedDates.filter(date =>
      !(date.getDate() === dateToRemove.getDate() &&
        date.getMonth() === dateToRemove.getMonth() &&
        date.getFullYear() === dateToRemove.getFullYear() &&
        date.getHours() === dateToRemove.getHours() &&
        date.getMinutes() === dateToRemove.getMinutes())
    )
    onDatesChange(newSelectedDates)
  }

  const isToday = (date) => {
    const today = new Date()
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelectedTemp = (date) => {
    return date && 
           date.getDate() === tempSelectedDate.getDate() &&
           date.getMonth() === tempSelectedDate.getMonth() &&
           date.getFullYear() === tempSelectedDate.getFullYear()
  }

  const isInSelectedDates = (date) => {
    return date && selectedDates.some(selectedDate =>
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    )
  }

  const isWeekend = (date) => {
    if (!date) return false
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday (0) or Saturday (6)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const days = getDaysInMonth(currentMonth)
  const { hours, minutes } = tempSelectedTime

  return (
    <div className="bg-gradient-to-br from-summer-yellow/20 to-summer-orange/20 rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full bg-summer-blue/20 text-summer-blue hover:bg-summer-blue/30"
          >
            <SafeIcon icon={FiChevronLeft} />
          </motion.button>

          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full bg-summer-blue/20 text-summer-blue hover:bg-summer-blue/30"
          >
            <SafeIcon icon={FiChevronRight} />
          </motion.button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
          {weekdays.map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-500 py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((date, index) => (
            <motion.button
              key={index}
              whileHover={date ? { scale: 1.1 } : {}}
              whileTap={date ? { scale: 0.9 } : {}}
              onClick={() => date && selectDate(date)}
              disabled={!date}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all relative
                ${!date ? 'invisible' : ''}
                ${isSelectedTemp(date) 
                  ? 'bg-summer-coral text-white shadow-lg' 
                  : isInSelectedDates(date) && !isSelectedTemp(date) 
                  ? 'bg-summer-blue text-white' 
                  : isToday(date) && !isSelectedTemp(date) && !isInSelectedDates(date)
                  ? 'bg-summer-yellow text-gray-800 border-2 border-summer-orange' 
                  : isWeekend(date) && !isSelectedTemp(date) && !isInSelectedDates(date) && !isToday(date)
                  ? 'bg-summer-blue/10 text-gray-700 hover:bg-summer-blue/20 border border-summer-blue/20'
                  : !isSelectedTemp(date) && !isInSelectedDates(date) && !isToday(date)
                  ? 'bg-gray-50 text-gray-700 hover:bg-summer-blue/20' 
                  : ''
                }
              `}
            >
              {date?.getDate()}
              {isInSelectedDates(date) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Picker */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <SafeIcon icon={FiClock} className="text-summer-coral" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Uhrzeit</h3>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-xs mx-auto">
            {/* Time Display */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center text-4xl font-bold text-gray-800 mb-4">
              <span className={hours === tempSelectedTime.hours ? 'text-summer-coral' : ''}>
                {hours.toString().padStart(2, '0')}
              </span>
              <span className="mx-2">:</span>
              <span className={minutes === tempSelectedTime.minutes ? 'text-summer-coral' : ''}>
                {minutes.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Hour Selector */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Stunden</p>
              <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateTime((hours - 1 + 24) % 24, minutes)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                  <SafeIcon icon={FiChevronLeft} />
                </motion.button>

                <div className="flex-1 text-center">
                  <select
                    value={hours}
                    onChange={(e) => updateTime(parseInt(e.target.value), minutes)}
                    className="bg-transparent text-center text-lg font-medium focus:outline-none appearance-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateTime((hours + 1) % 24, minutes)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                  <SafeIcon icon={FiChevronRight} />
                </motion.button>
              </div>
            </div>

            {/* Minute Selector */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Minuten</p>
              <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const newMinutes = Math.floor((minutes - 5 + 60) / 5) * 5 % 60;
                    updateTime(hours, newMinutes);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                  <SafeIcon icon={FiChevronLeft} />
                </motion.button>

                <div className="flex-1 text-center">
                  <select
                    value={minutes}
                    onChange={(e) => updateTime(hours, parseInt(e.target.value))}
                    className="bg-transparent text-center text-lg font-medium focus:outline-none appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const newMinutes = Math.floor((minutes + 5) / 5) * 5 % 60;
                    updateTime(hours, newMinutes);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                  <SafeIcon icon={FiChevronRight} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        {showAddButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addSelectedDate}
            className="w-full mt-4 bg-summer-blue text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiPlus} />
            <span>Termin hinzufügen</span>
          </motion.button>
        )}
      </div>

      {/* Selected Dates List */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <SafeIcon icon={FiCalendar} className="text-summer-blue" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Vorgeschlagene Termine</h3>
        </div>

        {selectedDates.length > 0 ? (
          <div className="space-y-2">
            {selectedDates.map((date, index) => {
              const isWeekendDate = isWeekend(date)
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-3 border ${
                    isWeekendDate 
                      ? 'bg-summer-blue/20 border-summer-blue/30' 
                      : 'bg-summer-blue/10 border-summer-blue/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiCalendar} className="text-summer-blue" />
                    <span className={`font-medium ${isWeekendDate ? 'text-summer-blue' : ''}`}>
                      {formatDate(date)}
                    </span>
                    <span className="text-summer-coral">{formatTime(date)} Uhr</span>
                    {isWeekendDate && (
                      <span className="text-xs bg-summer-blue/20 text-summer-blue px-2 py-0.5 rounded-full">
                        Wochenende
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeDate(date)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <SafeIcon icon={FiX} />
                  </motion.button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <SafeIcon icon={FiCalendar} className="text-4xl text-gray-300 mx-auto mb-2" />
            <p>Noch keine Termine vorgeschlagen</p>
            <p className="text-sm text-gray-400 mt-1">Wähle Datum und Uhrzeit aus und füge sie hinzu</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiDatePicker