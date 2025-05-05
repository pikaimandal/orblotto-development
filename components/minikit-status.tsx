'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

// Create a type definition for the global window object to avoid TypeScript errors
declare global {
  interface Window {
    __MINIKIT_INITIALIZED__?: boolean;
  }
}

export function MinikitStatus() {
  // Don't initialize any state before detection
  const [showWarning, setShowWarning] = useState<boolean | null>(null)

  useEffect(() => {
    // Give MiniKit more time to initialize
    const initialDelay = setTimeout(() => {
      // First check - might already be available
      if (MiniKit.isInstalled()) {
        setShowWarning(false)
        return;
      }
      
      // Set up polling to check repeatedly for MiniKit
      const checkInterval = setInterval(() => {
        if (MiniKit.isInstalled()) {
          setShowWarning(false)
          clearInterval(checkInterval)
        }
      }, 1000)
      
      // After a longer timeout, if MiniKit isn't detected, show the warning
      const warningDelay = setTimeout(() => {
        if (!MiniKit.isInstalled()) {
          console.warn('MiniKit not detected after extended timeout')
          setShowWarning(true)
          
          // Keep checking even after showing the warning
          // This handles the case where it becomes available later
          const warningCheckInterval = setInterval(() => {
            if (MiniKit.isInstalled()) {
              setShowWarning(false)
              clearInterval(warningCheckInterval)
            }
          }, 2000)
        }
      }, 3000) // Longer delay for showing warning
      
      return () => {
        clearTimeout(warningDelay)
        clearInterval(checkInterval)
      }
    }, 1500) // Initial delay to allow provider to initialize
    
    return () => clearTimeout(initialDelay)
  }, [])
  
  // Don't render anything until we've made a determination
  if (showWarning === null || showWarning === false) {
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