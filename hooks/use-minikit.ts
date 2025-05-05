'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export function useMiniKit() {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    // Check if MiniKit is available
    const checkMiniKitStatus = () => {
      try {
        const installed = MiniKit.isInstalled()
        setIsReady(installed)
        return installed
      } catch (error) {
        console.error('Error checking MiniKit installation status:', error)
        return false
      }
    }
    
    // Check immediately
    const initialStatus = checkMiniKitStatus()
    
    // If not installed on first check, poll a few times
    if (!initialStatus) {
      const checkInterval = setInterval(() => {
        if (checkMiniKitStatus()) {
          clearInterval(checkInterval)
        }
      }, 1000)
      
      // Clear interval after a few attempts
      setTimeout(() => clearInterval(checkInterval), 10000)
      
      return () => clearInterval(checkInterval)
    }
  }, [])
  
  return {
    minikit: isReady ? MiniKit : null,
    isReady,
    isWorldApp: isReady,
  }
}