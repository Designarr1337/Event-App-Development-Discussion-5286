import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiCalendar, FiClock, FiArrowRight } = FiIcons;

const EventOverview = ({ events }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-500 to-coral-400 bg-clip-text text-transparent">
            Meine Events
          </h1>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/create"
              className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-coral-400 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            >
              <SafeIcon icon={FiPlus} />
              Neues Event
            </Link>
          </motion.div>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl p-12 shadow-lg">
              <SafeIcon icon={FiCalendar} className="text-6xl text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Noch keine Events geplant
              </h2>
              <p className="text-gray-600 mb-8">
                Erstelle dein erstes Sommer-Event und beginne mit der Planung!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-coral-400 text-white px-8 py-4 rounded-full font-semibold"
              >
                <SafeIcon icon={FiPlus} />
                Erstes Event erstellen
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiCalendar} className="text-turquoise-500" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiClock} className="text-coral-500" />
                        <span>{formatTime(event.date)} Uhr</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-sm">
                      <span className="bg-turquoise-100 text-turquoise-700 px-3 py-1 rounded-full">
                        {event.items?.length || 0} Gegenstände
                      </span>
                      <span className="bg-sunny-100 text-sunny-700 px-3 py-1 rounded-full">
                        {Object.keys(event.assignments || {}).length} Zuweisungen
                      </span>
                    </div>
                  </div>
                  
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to={`/event/${event.id}`}
                      className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-coral-400 text-white px-6 py-3 rounded-full font-semibold"
                    >
                      Details
                      <SafeIcon icon={FiArrowRight} />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-turquoise-600 hover:text-turquoise-700 font-medium"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventOverview;