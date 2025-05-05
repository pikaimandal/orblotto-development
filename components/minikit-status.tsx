'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function MinikitStatus() {
  // Don't initialize any state before detection
  const [showWarning, setShowWarning] = useState<boolean | null>(null)

  useEffect(() => {
    // Initial check
    const installed = MiniKit.isInstalled()
    
    // If we're running in WorldApp, never show the warning
    if (installed) {
      setShowWarning(false)
      return;
    }
    
    // If we're not in WorldApp, wait a short delay then show warning
    const timer = setTimeout(() => {
      if (!MiniKit.isInstalled()) {
        setShowWarning(true)
        
        // Set a timeout to eventually hide the warning
        const hideTimer = setTimeout(() => {
          setShowWarning(false)
        }, 10000)
        
        return () => clearTimeout(hideTimer)
      }
    }, 1000) // Longer delay to ensure detection works
    
    // Clean up
    return () => clearTimeout(timer)
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
        </AlertDescription>
      </Alert>
    </div>
  )
} 