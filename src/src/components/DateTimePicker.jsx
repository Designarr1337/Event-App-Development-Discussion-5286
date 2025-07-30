import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiChevronLeft, FiChevronRight, FiClock } = FiIcons

const DateTimePicker = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth())
  )

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
    const newDate = new Date(selectedDate)
    newDate.setFullYear(date.getFullYear())
    newDate.setMonth(date.getMonth())
    newDate.setDate(date.getDate())
    onDateChange(newDate)
  }

  const updateTime = (hours, minutes) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    onDateChange(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    return date && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const isWeekend = (date) => {
    if (!date) return false
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday (0) or Saturday (6)
  }

  const days = getDaysInMonth(currentMonth)
  const hours = selectedDate.getHours()
  const minutes = selectedDate.getMinutes()

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
                aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                ${!date ? 'invisible' : ''}
                ${isSelected(date) 
                  ? 'bg-gradient-to-r from-summer-coral to-summer-orange text-white shadow-lg' 
                  : isToday(date) 
                  ? 'bg-summer-yellow text-gray-800 border-2 border-summer-orange' 
                  : isWeekend(date)
                  ? 'bg-summer-blue/10 text-gray-700 hover:bg-summer-blue/20 border border-summer-blue/20'
                  : 'bg-gray-50 text-gray-700 hover:bg-summer-blue/20'
                }
              `}
            >
              {date?.getDate()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modern Time Picker */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <SafeIcon icon={FiClock} className="text-summer-coral" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Uhrzeit</h3>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-xs mx-auto">
            {/* Time Display */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center text-4xl font-bold text-gray-800 mb-4">
              <span className={`${hours === selectedDate.getHours() ? 'text-summer-coral' : ''}`}>
                {hours.toString().padStart(2, '0')}
              </span>
              <span className="mx-2">:</span>
              <span className={`${minutes === selectedDate.getMinutes() ? 'text-summer-coral' : ''}`}>
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
      </div>

      {/* Selected Date Display */}
      <div className="bg-white rounded-2xl p-3 md:p-4 shadow-lg text-center">
        <p className="text-gray-600 text-xs md:text-sm mb-1">Gewählter Termin:</p>
        <p className="text-base md:text-lg font-semibold text-gray-800">
          {selectedDate.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-summer-coral font-medium">
          {selectedDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
        </p>
      </div>
    </div>
  )
}

export default DateTimePicker