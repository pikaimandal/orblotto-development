'use client'

import { useEffect, useState } from 'react'
import { useMiniKit as useWorldcoinMiniKit } from '@worldcoin/minikit-react'

export function useMiniKit() {
  const minikit = useWorldcoinMiniKit()
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    // When minikit object is available, check if it's installed
    if (minikit) {
      const checkMiniKitStatus = () => {
        try {
          const installed = minikit.isInstalled()
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
    }
  }, [minikit])
  
  return {
    minikit,
    isReady,
    isWorldApp: isReady,
  }
}