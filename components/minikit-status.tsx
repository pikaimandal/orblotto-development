'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useMiniKit } from '@/hooks/use-minikit'

export function MinikitStatus() {
  const { isWorldApp } = useMiniKit()
  const [showWarning, setShowWarning] = useState(false)
  
  useEffect(() => {
    // Give MiniKit time to initialize before showing warning
    const timer = setTimeout(() => {
      setShowWarning(!isWorldApp)
    }, 3000)
    
    // Hide warning after showing it for a while if we're in development
    if (!isWorldApp && process.env.NODE_ENV === 'development') {
      const hideTimer = setTimeout(() => {
        setShowWarning(false)
      }, 10000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    }
    
    return () => clearTimeout(timer)
  }, [isWorldApp])
  
  // Don't render anything if we're in WorldApp or shouldn't show warning
  if (isWorldApp || !showWarning) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-4 z-50">
      <Alert className="bg-orange-950 border-orange-900">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-500">WorldApp Not Detected</AlertTitle>
        <AlertDescription className="text-orange-300">
          This app is designed to run in WorldApp. Some features may not work properly.
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs">
              Running in development mode - wallet fallbacks will be used.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}