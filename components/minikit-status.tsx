'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useMiniKit } from '@/hooks/use-minikit'
import { MiniKit } from '@worldcoin/minikit-js'

export function MinikitStatus() {
  const { isWorldApp, isDetecting } = useMiniKit()
  const [showWarning, setShowWarning] = useState(false)
  
  // Simpler logic that only shows the warning after detection is complete
  // and only if we're not in WorldApp
  useEffect(() => {
    // First, check the direct API to ensure we're getting the latest status
    try {
      // If MiniKit.isInstalled() returns true, we're definitely in WorldApp
      if (MiniKit.isInstalled()) {
        setShowWarning(false)
        return
      }
    } catch (error) {
      // Error in checking means we're likely not in WorldApp
      console.warn('Error checking MiniKit.isInstalled():', error)
    }

    // Only show warning if detection is complete and not in WorldApp
    if (!isDetecting) {
      setShowWarning(!isWorldApp)
      
      // In dev mode, hide warning after a while
      if (process.env.NODE_ENV === 'development' && !isWorldApp) {
        const timer = setTimeout(() => {
          setShowWarning(false)
        }, 10000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isWorldApp, isDetecting])
  
  // Don't render anything if we don't need to show the warning
  if (!showWarning) {
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