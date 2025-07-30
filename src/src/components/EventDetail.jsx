import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import ExpirationInfo from './ExpirationInfo'
import VotingSection from './VotingSection'
import DateVotingSection from './DateVotingSection'
import EventSummary from './EventSummary'
import ConfirmDialog from './ConfirmDialog'
import { eventService } from '../utils/urlStorageService'
import { formatDate, formatTime } from '../utils/eventUtils'
import supabase from '../lib/supabase'

const { FiArrowLeft, FiPlus, FiTrash2, FiCalendar, FiClock, FiUser, FiShare2, FiCopy, FiPrinter, FiSave, FiCheck, FiFileText, FiUpload, FiRefreshCw } = FiIcons

const EventDetail = () => {
  const { eventCode } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const pageTopRef = useRef(null)
  
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newItem, setNewItem] = useState('')
  const [bulkItems, setBulkItems] = useState('')
  const [showBulkInput, setShowBulkInput] = useState(false)
  const [assignmentPerson, setAssignmentPerson] = useState('')
  const [selectedItems, setSelectedItems] = useState([]) // Changed to array for multi-select
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showBottomBar, setShowBottomBar] = useState(false)
  const [currentShareableUrl, setCurrentShareableUrl] = useState('')
  const [lastSyncTime, setLastSyncTime] = useState(new Date())
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle', 'syncing', 'success', 'error'
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true)
  const autoSyncIntervalRef = useRef(null)
  const bottomBarRef = useRef(null)
  const eventDataRef = useRef(null) // Reference to store current event data

  // Delete confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [assignmentToRemove, setAssignmentToRemove] = useState(null)

  // Store event data in ref for access in interval functions
  useEffect(() => {
    eventDataRef.current = event
  }, [event])

  // Scroll to top when component mounts or event changes
  useEffect(() => {
    const scrollToTop = () => {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    
    const timeoutId = setTimeout(scrollToTop, 100)
    return () => clearTimeout(timeoutId)
  }, [eventCode])

  // Handle scroll events for bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      
      if (scrollPosition > 500) {
        setShowBottomBar(true)
      } else {
        setShowBottomBar(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load event data on initial render
  useEffect(() => {
    loadEvent()
  }, [eventCode])

  // Set up auto-sync interval
  useEffect(() => {
    if (isAutoSyncEnabled && event) {
      // Clear any existing interval
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current)
      }
      
      // Set up new interval - sync every 30 seconds
      autoSyncIntervalRef.current = setInterval(() => {
        if (eventDataRef.current) {
          updateShareableUrl(eventDataRef.current)
            .then(() => {
              setLastSyncTime(new Date())
              setSyncStatus('success')
              setTimeout(() => setSyncStatus('idle'), 2000)
            })
            .catch(() => {
              setSyncStatus('error')
              setTimeout(() => setSyncStatus('idle'), 2000)
            })
        }
      }, 30000) // 30 seconds interval
    }
    
    return () => {
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current)
      }
    }
  }, [isAutoSyncEnabled, event])

  const loadEvent = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const urlData = searchParams.get('data')
      const result = await eventService.getEventByCode(eventCode, urlData)
      if (result.success) {
        setEvent(result.data)
        // Generate initial shareable URL and store it
        const urlResult = await updateShareableUrl(result.data)
        if (urlResult) {
          // Start the auto-sync
          setIsAutoSyncEnabled(true)
          setLastSyncTime(new Date())
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

  // Function to update shareable URL and browser URL
  const updateShareableUrl = async (eventData) => {
    try {
      setSyncStatus('syncing')
      const result = await eventService.saveEventData(eventData)
      if (result.success) {
        // Create the full shareable URL with absolute path
        const baseUrl = window.location.origin
        const pathWithoutQuery = window.location.pathname.split('?')[0]
        const hashRoute = `#/event/${eventCode}`
        const dataParam = result.url.split('data=')[1]
        
        // Construct final URL
        const newUrl = `${baseUrl}${hashRoute}?data=${dataParam}`
        
        // Update the current URL in browser without page reload
        // Use replaceState to avoid adding to browser history
        const stateObj = { eventCode, data: dataParam }
        window.history.replaceState(stateObj, '', `${hashRoute}?data=${dataParam}`)
        
        // Update searchParams to reflect new data
        setSearchParams({ data: dataParam })
        
        // Store the full shareable URL for copying/sharing
        setCurrentShareableUrl(newUrl)
        
        setSyncStatus('success')
        setTimeout(() => setSyncStatus('idle'), 2000)
        return true
      }
    } catch (error) {
      console.error('Error updating shareable URL:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }
    return false
  }

  const updateEventData = async (updatedEvent) => {
    setEvent(updatedEvent)
    
    // Automatically update the URL with new data
    await updateShareableUrl(updatedEvent)
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim() || !event) return

    try {
      const result = await eventService.addItem(event, newItem.trim())
      if (result.success) {
        await updateEventData(result.data)
        setNewItem('')
        toast.success('Gegenstand hinzugefügt')
      } else {
        toast.error('Fehler beim Hinzufügen')
      }
    } catch (error) {
      toast.error('Unerwarteter Fehler')
    }
  }

  const addBulkItems = async (e) => {
    e.preventDefault()
    if (!bulkItems.trim() || !event) return

    try {
      // Split items by new line and filter out empty lines
      const itemsList = bulkItems
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(item => item !== '')
      
      if (itemsList.length === 0) {
        toast.error('Keine gültigen Gegenstände gefunden')
        return
      }
      
      let updatedEventData = { ...event }
      let addedCount = 0
      
      // Add each item one by one
      for (const itemName of itemsList) {
        const result = await eventService.addItem(updatedEventData, itemName)
        if (result.success) {
          updatedEventData = result.data
          addedCount++
        }
      }
      
      // Update event data with all added items
      await updateEventData(updatedEventData)
      setBulkItems('')
      setShowBulkInput(false)
      toast.success(`${addedCount} Gegenstände hinzugefügt`)
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der Gegenstände')
    }
  }

  const confirmRemoveItem = (itemId) => {
    setItemToDelete(itemId)
    setShowDeleteConfirm(true)
  }

  const removeItem = async (itemId) => {
    if (!event) return

    try {
      const result = await eventService.removeItem(event, itemId)
      if (result.success) {
        await updateEventData(result.data)
        // Remove item from selected items if it was selected
        setSelectedItems(prev => prev.filter(id => id !== itemId))
        toast.success('Gegenstand entfernt')
      } else {
        toast.error('Fehler beim Entfernen')
      }
    } catch (error) {
      toast.error('Unerwarteter Fehler')
    }
  }

  // Toggle item selection for multi-select
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Assign multiple selected items to person
  const assignSelectedItems = async (e) => {
    e.preventDefault()
    if (selectedItems.length === 0 || !assignmentPerson.trim() || !event) return

    try {
      let updatedEventData = { ...event }
      let assignedCount = 0

      // Assign each selected item
      for (const itemId of selectedItems) {
        const result = await eventService.assignItem(updatedEventData, itemId, assignmentPerson.trim())
        if (result.success) {
          updatedEventData = result.data
          assignedCount++
        }
      }

      // Update event data with all assignments
      await updateEventData(updatedEventData)
      setAssignmentPerson('')
      setSelectedItems([])
      toast.success(`${assignedCount} Gegenstände zugewiesen`)
    } catch (error) {
      toast.error('Unerwarteter Fehler')
    }
  }

  const confirmRemoveAssignment = (itemId) => {
    setAssignmentToRemove(itemId)
    setShowDeleteConfirm(true)
  }

  const removeAssignment = async (itemId) => {
    if (!event) return

    try {
      const result = await eventService.removeAssignment(event, itemId)
      if (result.success) {
        await updateEventData(result.data)
        toast.success('Zuweisung entfernt')
      } else {
        toast.error('Fehler beim Entfernen der Zuweisung')
      }
    } catch (error) {
      toast.error('Unerwarteter Fehler')
    }
  }

  const toggleAutoSync = () => {
    setIsAutoSyncEnabled(!isAutoSyncEnabled)
    if (!isAutoSyncEnabled) {
      toast.success('Auto-Sync aktiviert - Änderungen werden automatisch gespeichert')
    } else {
      toast.info('Auto-Sync deaktiviert - Änderungen werden nicht mehr automatisch gespeichert')
    }
  }

  const manualSync = async () => {
    if (!event) return
    
    setIsSaving(true)
    try {
      await updateShareableUrl(event)
      setLastSyncTime(new Date())
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
      toast.success('Event-Daten aktualisiert! Der Link enthält die neuesten Daten.')
    } catch (error) {
      toast.error('Fehler beim Aktualisieren')
    } finally {
      setIsSaving(false)
    }
  }

  const copyEventLink = () => {
    if (!event) return
    
    // Make sure we have the latest link
    updateShareableUrl(event).then(() => {
      const linkToCopy = currentShareableUrl || window.location.href
      
      // Use the Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(linkToCopy)
          .then(() => {
            toast.success('Aktueller Link kopiert! Alle Änderungen sind enthalten.')
          })
          .catch(() => {
            // Fallback for older browsers
            fallbackCopyTextToClipboard(linkToCopy)
          })
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(linkToCopy)
      }
    })
  }

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        toast.success('Aktueller Link kopiert! Alle Änderungen sind enthalten.')
      } else {
        toast.error('Kopieren fehlgeschlagen')
      }
    } catch (err) {
      toast.error('Kopieren nicht unterstützt')
    }

    document.body.removeChild(textArea)
  }

  const shareEvent = async () => {
    if (!event) return
    
    // Make sure we have the latest link
    await updateShareableUrl(event)
    const linkToShare = currentShareableUrl || window.location.href
    
    // Try native sharing first
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `Event: ${event.name}`,
          text: `Komm zu meinem Event: ${event.name}`,
          url: linkToShare
        })
        return // Successfully shared, don't copy to clipboard
      } catch (error) {
        // User cancelled sharing or error occurred, fall back to copy
        if (error.name !== 'AbortError') {
          console.log('Share failed:', error)
        }
      }
    }
    
    // Fallback to copying link
    copyEventLink()
  }

  const printEvent = () => {
    if (!event) return

    const printWindow = window.open('', '_blank')
    const items = event?.event_items_ev2025 || []
    const assignments = event?.event_assignments_ev2025 || []
    const activities = event?.event_activities_ev2025 || []
    const dateVotes = event?.event_date_votes || []
    const proposedDates = event?.proposed_dates || []
    
    // Sort activities by votes
    const sortedActivities = [...activities].sort((a, b) => (b.votes || 0) - (a.votes || 0))
    
    // Sort dates by votes if available
    let sortedDates = []
    if (proposedDates && proposedDates.length > 0) {
      sortedDates = [...proposedDates].sort((a, b) => {
        const aVotes = dateVotes.filter(vote => vote.date_id === a.id).length
        const bVotes = dateVotes.filter(vote => vote.date_id === b.id).length
        return bVotes - aVotes
      })
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event: ${event.name}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF8A65; padding-bottom: 20px; }
          .event-info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #FF8A65; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .item-list { list-style: none; padding: 0; }
          .item-list li { padding: 8px; margin: 5px 0; background: #f5f5f5; border-radius: 4px; }
          .assigned { background: #e8f5e8; }
          .vote-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: #f0f8ff; border-radius: 4px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
          .summary { background: #fff8e1; padding: 15px; border-radius: 8px; border-left: 4px solid #FFD180; margin: 20px 0; }
          .summary h3 { color: #FF8A65; margin-top: 0; }
          .missing-items { color: #f44336; }
          .url-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .date-vote-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: #e1f5fe; border-radius: 4px; }
          @media print {
            body { font-size: 12pt; }
            .no-print { display: none; }
            a { text-decoration: none; color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${event.name}</h1>
          <p><strong>Datum:</strong> ${formatDate(event?.event_date)}</p>
          <p><strong>Uhrzeit:</strong> ${formatTime(event?.event_date)} Uhr</p>
          <p><strong>Event-Code:</strong> ${event?.event_code}</p>
        </div>
        
        <div class="url-info">
          <h3>🔗 Aktueller Event-Link</h3>
          <p style="font-family: monospace; word-break: break-all; font-size: 10pt;">${currentShareableUrl || window.location.href}</p>
          <p style="font-size: 10pt; color: #666; margin-top: 10px;">Dieser Link wird automatisch aktualisiert und enthält immer die neuesten Daten</p>
        </div>
        
        <div class="summary">
          <h3>📋 Zusammenfassung</h3>
          ${sortedActivities.length > 0 ? 
            `<p><strong>Beliebteste Aktivität:</strong> ${sortedActivities[0].name} (${sortedActivities[0].votes || 0} Stimmen)</p>` : 
            '<p>Noch keine Aktivitäten vorgeschlagen</p>'
          }
          ${sortedDates.length > 0 ?
            `<p><strong>Beliebtester Termin:</strong> ${new Date(sortedDates[0].date).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'})} um ${new Date(sortedDates[0].date).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})} Uhr</p>` :
            ''
          }
          <p><strong>Mitbringsel:</strong> ${assignments.length} von ${items.length} zugewiesen</p>
          ${items.length - assignments.length > 0 ? 
            `<p class="missing-items"><strong>Es fehlen noch:</strong> ${items.length - assignments.length} Zuweisungen</p>` : 
            items.length > 0 ? '<p><strong>Super!</strong> Alle Gegenstände sind zugewiesen.</p>' : ''
          }
        </div>
        
        ${proposedDates && proposedDates.length > 0 ? `
        <div class="section">
          <h3>📅 Terminabstimmung</h3>
          ${sortedDates.map((dateOption, index) => {
            const votes = dateVotes.filter(vote => vote.date_id === dateOption.id);
            return `
              <div class="date-vote-item">
                <div>
                  <strong>${new Date(dateOption.date).toLocaleDateString('de-DE', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'})}</strong> 
                  um ${new Date(dateOption.date).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})} Uhr
                </div>
                <div><strong>${votes.length} ${votes.length === 1 ? 'Stimme' : 'Stimmen'}</strong></div>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          <h3>🎯 Was wollen wir machen?</h3>
          ${activities.map(activity => `
            <div class="vote-item">
              <span>${activity.name}</span>
              <span><strong>${activity.votes || 0} Stimmen</strong></span>
            </div>
          `).join('')}
          ${activities.length === 0 ? '<p>Keine Aktivitäten vorgeschlagen</p>' : ''}
        </div>
        
        <div class="section">
          <h3>📝 Was wird noch benötigt?</h3>
          <ul class="item-list">
            ${items.map(item => {
              const assignment = assignments.find(a => a.item_id === item.id)
              return `<li class="${assignment ? 'assigned' : ''}">${item.name}${assignment ? ` - <strong>${assignment.person_name}</strong>` : ''}</li>`
            }).join('')}
            ${items.length === 0 ? '<li>Keine Gegenstände definiert</li>' : ''}
          </ul>
        </div>
        
        <div class="footer">
          <p>Erstellt mit EventSeite.com • © 2025 by Carlo Krämer</p>
          <p>Gedruckt am: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleVoteUpdate = (updatedEventData) => {
    updateEventData(updatedEventData)
  }

  const handleDateVoteUpdate = (updatedEventData) => {
    updateEventData(updatedEventData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSpinner message="Event wird geladen..." />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <ErrorMessage
          title="Event nicht gefunden"
          message={error || "Die Event-Daten konnten nicht geladen werden. Eventuell ist der Link ungültig oder abgelaufen."}
          onHome={() => navigate('/')}
        />
      </div>
    )
  }

  const items = event?.event_items_ev2025 || []
  const assignments = event?.event_assignments_ev2025 || []
  const activities = event?.event_activities_ev2025 || []
  const unassignedItems = items.filter(item =>
    !assignments.some(assignment => assignment.item_id === item.id)
  )

  // Format the last sync time
  const formattedSyncTime = lastSyncTime.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // Get assigned item IDs for visual indication
  const assignedItemIds = assignments.map(assignment => assignment.item_id)

  // Check if this event has proposed dates for voting
  const hasDateVoting = event?.isMultiDay && event?.proposed_dates && event?.proposed_dates.length > 0

  return (
    <div className="min-h-screen py-6 px-3 md:py-8 md:px-4 pb-16">
      {/* Invisible anchor for scrolling to top */}
      <div ref={pageTopRef} className="absolute top-0" />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setItemToDelete(null)
          setAssignmentToRemove(null)
        }}
        onConfirm={() => {
          if (itemToDelete) {
            removeItem(itemToDelete)
            setItemToDelete(null)
          } else if (assignmentToRemove) {
            removeAssignment(assignmentToRemove)
            setAssignmentToRemove(null)
          }
          setShowDeleteConfirm(false)
        }}
        title="Wirklich löschen?"
        message={
          itemToDelete 
            ? "Möchtest du diesen Gegenstand wirklich löschen? Alle Zuweisungen werden ebenfalls entfernt." 
            : assignmentToRemove 
              ? "Möchtest du diese Zuweisung wirklich entfernen?" 
              : "Bist du sicher, dass du das löschen möchtest?"
        }
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
      />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 md:mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-summer-blue hover:text-summer-coral text-lg"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span className="hidden md:inline">Zurück zur Startseite</span>
            <span className="md:hidden">Zurück</span>
          </button>
        </motion.div>

        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 md:p-8 shadow-xl mb-6 md:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{event?.name}</h1>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={manualSync}
                disabled={isSaving || syncStatus === 'syncing'}
                className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap ${
                  syncStatus === 'error' 
                    ? 'bg-red-500 text-white' 
                    : syncStatus === 'success' || showSaveSuccess 
                      ? 'bg-summer-green text-white' 
                      : syncStatus === 'syncing' || isSaving
                        ? 'bg-summer-yellow text-gray-800'
                        : 'bg-summer-green text-white'
                }`}
              >
                <SafeIcon 
                  icon={
                    syncStatus === 'error' 
                      ? FiRefreshCw
                      : syncStatus === 'syncing' || isSaving
                        ? FiClock
                        : syncStatus === 'success' || showSaveSuccess
                          ? FiCheck
                          : FiRefreshCw
                  } 
                  className={syncStatus === 'syncing' || isSaving ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">
                  {syncStatus === 'error' 
                    ? 'Erneut versuchen' 
                    : syncStatus === 'syncing' || isSaving
                      ? 'Synchronisiere...'
                      : syncStatus === 'success' || showSaveSuccess
                        ? 'Aktualisiert!'
                        : 'Jetzt aktualisieren'}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={printEvent}
                className="bg-summer-blue text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <SafeIcon icon={FiFileText} />
                <span className="hidden sm:inline">PDF/Drucken</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareEvent}
                className="bg-summer-blue text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <SafeIcon icon={FiShare2} />
                <span className="hidden sm:inline">Teilen</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyEventLink}
                className="bg-summer-coral text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <SafeIcon icon={FiCopy} />
                <span className="hidden sm:inline">Link kopieren</span>
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6 text-base md:text-lg mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <SafeIcon icon={FiCalendar} className="text-summer-coral text-xl" />
              <span className="text-gray-700">{formatDate(event?.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <SafeIcon icon={FiClock} className="text-summer-orange text-xl" />
              <span className="text-gray-700">{formatTime(event?.event_date)} Uhr</span>
            </div>
          </div>

          <div className="bg-summer-yellow/20 rounded-2xl p-3 md:p-4 mb-3 md:mb-4">
            <p className="text-gray-700">
              <strong>Event-Code:</strong>{' '}
              <span className="font-mono text-lg">{event?.event_code}</span>
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-600">
                🔄 Automatische Echtzeit-Synchronisierung {isAutoSyncEnabled ? 'aktiv' : 'inaktiv'}
              </p>
              <button 
                onClick={toggleAutoSync}
                className={`text-xs px-2 py-1 rounded-full ${
                  isAutoSyncEnabled 
                    ? 'bg-summer-green/20 text-summer-green' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isAutoSyncEnabled ? 'Auto-Sync AN' : 'Auto-Sync AUS'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Letzte Aktualisierung: {formattedSyncTime} Uhr
            </p>
          </div>

          <ExpirationInfo eventData={event} />
        </motion.div>

        {/* Date Voting Section - if applicable */}
        {hasDateVoting && (
          <DateVotingSection 
            eventData={event} 
            onDateVoteUpdate={handleDateVoteUpdate}
          />
        )}

        {/* Voting Section */}
        <VotingSection eventData={event} onVoteUpdate={handleVoteUpdate} />

        <div className="grid md:grid-cols-2 gap-5 md:gap-8 mb-6 mt-6">
          {/* Was wird noch benötigt? - Enhanced with visual indicators for assigned items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 md:mb-6">Was wird noch benötigt?</h2>

            {/* Toggle between single and bulk input */}
            <div className="flex mb-4">
              <button 
                onClick={() => setShowBulkInput(false)}
                className={`px-4 py-2 rounded-l-lg ${!showBulkInput ? 'bg-summer-coral text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Einzeln
              </button>
              <button 
                onClick={() => setShowBulkInput(true)}
                className={`px-4 py-2 rounded-r-lg ${showBulkInput ? 'bg-summer-coral text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Mehrere
              </button>
            </div>

            {/* Single Item Input */}
            {!showBulkInput ? (
              <form onSubmit={addItem} className="mb-5 md:mb-6">
                <div className="flex gap-2 md:gap-3 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="z.B. Grillrost, Getränke..."
                    className="flex-1 w-full min-w-0 px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none text-base md:text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-summer-coral text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap min-w-[110px] justify-center mt-0 sm:mt-0"
                  >
                    <SafeIcon icon={FiPlus} />
                    <span>Hinzufügen</span>
                  </motion.button>
                </div>
              </form>
            ) : (
              /* Bulk Items Input */
              <form onSubmit={addBulkItems} className="mb-5 md:mb-6">
                <div className="mb-3">
                  <textarea
                    value={bulkItems}
                    onChange={(e) => setBulkItems(e.target.value)}
                    placeholder="Füge mehrere Gegenstände ein. Trenne sie durch Kommas oder Zeilenumbrüche:&#10;&#10;Getränke&#10;Salat&#10;Kuchen&#10;Teller, Besteck, Servietten"
                    className="w-full px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-coral focus:outline-none text-base md:text-lg min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!bulkItems.trim()}
                    className="bg-summer-coral text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <SafeIcon icon={FiUpload} />
                    <span>Alle hinzufügen</span>
                  </motion.button>
                </div>
              </form>
            )}

            <div className="space-y-2 md:space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    assignedItemIds.includes(item.id) 
                      ? 'bg-summer-green/20 border border-summer-green/30' 
                      : selectedItems.includes(item.id)
                        ? 'bg-summer-blue/20 border border-summer-blue/30'
                        : 'bg-red-50 border border-red-100'
                  }`}
                >
                  <span className={`text-base md:text-lg mr-2 ${
                    assignedItemIds.includes(item.id) ? 'text-summer-green font-medium' : 'text-gray-700'
                  }`}>
                    {item.name}
                    {assignedItemIds.includes(item.id) && (
                      <span className="ml-2 text-xs bg-summer-green/20 text-summer-green px-2 py-1 rounded-full">
                        ✓ Zugewiesen
                      </span>
                    )}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => confirmRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </motion.button>
                </motion.div>
              ))}
              {items.length === 0 && (
                <p className="text-gray-500 text-center py-6 md:py-8 text-base md:text-lg">
                  Noch keine Gegenstände hinzugefügt
                </p>
              )}
            </div>
          </motion.div>

          {/* Wer bringt was mit? - Enhanced with Multi-Select */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 md:mb-6">Wer bringt was mit?</h2>

            {unassignedItems.length > 0 && (
              <form onSubmit={assignSelectedItems} className="mb-5 md:mb-6 space-y-3 md:space-y-4">
                {/* Name input */}
                <input
                  type="text"
                  value={assignmentPerson}
                  onChange={(e) => setAssignmentPerson(e.target.value)}
                  placeholder="Dein Name"
                  className="w-full px-3 md:px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-summer-green focus:outline-none text-base md:text-lg"
                />

                {/* Multi-select items */}
                <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Wähle Gegenstände aus (mehrere möglich):
                  </p>
                  <div className="space-y-2">
                    {unassignedItems.map((item) => (
                      <motion.label
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                          selectedItems.includes(item.id)
                            ? 'bg-summer-green/20 border-2 border-summer-green'
                            : 'bg-white hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 text-summer-green border-gray-300 rounded focus:ring-summer-green"
                        />
                        <span className="text-gray-800 flex-1">{item.name}</span>
                        {selectedItems.includes(item.id) && (
                          <SafeIcon icon={FiCheck} className="text-summer-green" />
                        )}
                      </motion.label>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={selectedItems.length === 0 || !assignmentPerson.trim()}
                  className="w-full bg-summer-green text-white px-4 md:px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiUser} />
                  {selectedItems.length > 0 
                    ? `${selectedItems.length} Gegenstand${selectedItems.length > 1 ? 'e' : ''} zuweisen`
                    : 'Gegenstände auswählen'
                  }
                </motion.button>
              </form>
            )}

            <div className="space-y-2 md:space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {assignments.map((assignment, index) => {
                const assignedItem = items.find(item => item.id === assignment.item_id)
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between bg-gradient-to-r from-summer-green/20 to-summer-blue/20 p-3 md:p-4 rounded-xl border border-summer-green/30"
                  >
                    <div className="flex items-center gap-2 md:gap-3 mr-2">
                      <SafeIcon icon={FiUser} className="text-summer-green" />
                      <div>
                        <p className="font-semibold text-gray-800 text-base md:text-lg">{assignment.person_name}</p>
                        <p className="text-gray-600 text-sm md:text-base">{assignedItem?.name}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => confirmRemoveAssignment(assignment.item_id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </motion.button>
                  </motion.div>
                )
              })}
              {assignments.length === 0 && (
                <p className="text-gray-500 text-center py-6 md:py-8 text-base md:text-lg">
                  Noch keine Zuweisungen gemacht
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Event Summary - Enhanced as Accordion */}
        <EventSummary 
          activities={activities} 
          items={items} 
          assignments={assignments}
          dateVotes={event?.event_date_votes || []}
          proposedDates={event?.proposed_dates || []}
        />
      </div>

      {/* Bottom Action Bar - Appears when scrolled down */}
      <AnimatePresence>
        {showBottomBar && (
          <motion.div
            ref={bottomBarRef}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-3 px-4 z-50"
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-gray-800 font-medium truncate max-w-[30%] hidden sm:block">
                {event?.name}
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-2">
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' : syncStatus === 'success' ? 'bg-green-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                <span>
                  {syncStatus === 'syncing' 
                    ? 'Synchronisiere...' 
                    : isAutoSyncEnabled 
                      ? 'Auto-Sync aktiv' 
                      : 'Auto-Sync inaktiv'}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={manualSync}
                  disabled={syncStatus === 'syncing' || isSaving}
                  className="bg-summer-green text-white px-3 py-2 rounded-full font-semibold flex items-center gap-2 text-sm"
                >
                  <SafeIcon icon={syncStatus === 'syncing' || isSaving ? FiClock : FiRefreshCw} 
                    className={syncStatus === 'syncing' || isSaving ? "animate-spin" : ""} />
                  <span>Aktualisieren</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareEvent}
                  className="bg-summer-coral text-white px-3 py-2 rounded-full font-semibold flex items-center gap-2 text-sm"
                >
                  <SafeIcon icon={FiShare2} />
                  <span>Teilen</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="text-center text-gray-500 py-4 mt-8 text-sm">
        <p>© 2025 by Carlo Krämer</p>
      </div>
    </div>
  )
}

export default EventDetail