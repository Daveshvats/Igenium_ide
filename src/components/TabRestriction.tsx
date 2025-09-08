'use client'

import { useEffect, useState, useCallback } from 'react'

interface TabRestrictionProps {
  onWarningAdded?: () => void
}

export function TabRestriction({ onWarningAdded }: TabRestrictionProps) {
  const [isFocused, setIsFocused] = useState(true)
  const [warningCount, setWarningCount] = useState(0)
  const [isProcessingWarning, setIsProcessingWarning] = useState(false)
  const [lastWarningTime, setLastWarningTime] = useState(0)

  const addWarning = useCallback(async (reason: string) => {
    // Prevent duplicate warnings within 2 seconds
    const now = Date.now()
    if (isProcessingWarning || (now - lastWarningTime) < 2000) {
      return
    }

    setIsProcessingWarning(true)
    setLastWarningTime(now)

    try {
      const response = await fetch('/api/admin/users/me/warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Warning added:', data.message)
        setWarningCount(prev => prev + 1)
        onWarningAdded?.()
      } else {
        console.error('Failed to add warning')
      }
    } catch (error) {
      console.error('Error adding warning:', error)
    } finally {
      setIsProcessingWarning(false)
    }
  }, [isProcessingWarning, lastWarningTime, onWarningAdded])

  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden) {
        setIsFocused(false)
        
        // Add warning to user account
        addWarning(`Tab switching violation - Attempt ${warningCount + 1}`)
        
        // Show warning
        alert(`Warning ${warningCount + 1}: You are not allowed to switch tabs or windows during problem solving. Please stay focused on the current tab.`)
        
        // Force focus back to the window
        window.focus()
      } else {
        setIsFocused(true)
      }
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    // Use only visibilitychange to prevent duplicate warnings
    document.addEventListener('visibilitychange', handleTabSwitch)
    window.addEventListener('focus', handleFocus)

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault()
        alert('Developer tools are disabled during problem solving.')
        return
      }

      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        alert('Developer tools are disabled during problem solving.')
        return
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        alert('Developer tools are disabled during problem solving.')
        return
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        alert('View source is disabled during problem solving.')
        return
      }

      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        alert('Saving is disabled during problem solving.')
        return
      }

      // Disable Ctrl+A (Select All) - optional, can be restrictive
      // if (e.ctrlKey && e.key === 'a') {
      //   e.preventDefault()
      //   return
      // }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleTabSwitch)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [warningCount, addWarning])

  // Show a subtle indicator when the user is focused
  if (!isFocused) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium z-50">
        ⚠️ Stay focused! You are not allowed to switch tabs or windows.
      </div>
    )
  }

  return null
}
