'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useMiniKit } from '@/hooks/use-minikit'

export function MinikitStatus() {
  const { isWorldApp, isReady, isDetecting } = useMiniKit()
  const [showWarning, setShowWarning] = useState<boolean>(false)
  
  // Logic to determine if we should show the warning
  useEffect(() => {
    // If we know we're in WorldApp, never show the warning
    if (isWorldApp) {
      setShowWarning(false)
      return
    }

    // Only show warning if not in WorldApp and we've finished detection
    if (!isWorldApp && !isDetecting) {
      setShowWarning(true)
      
      // In development, hide warning after some time
      if (process.env.NODE_ENV === 'development') {
        const timer = setTimeout(() => {
          setShowWarning(false)
        }, 10000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isWorldApp, isDetecting])
  
  // Don't render anything when detection is still ongoing or we're in WorldApp
  if (isDetecting || isWorldApp || !showWarning) {
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