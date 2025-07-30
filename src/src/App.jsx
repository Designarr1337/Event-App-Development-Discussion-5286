import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './components/LandingPage'
import CreateEvent from './components/CreateEvent'
import EventDetail from './components/EventDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-summer-yellow/30 to-summer-orange/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:eventCode" element={<EventDetail />} />
        </Routes>
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              fontSize: '16px',
              borderRadius: '12px',
              padding: '12px 20px',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App