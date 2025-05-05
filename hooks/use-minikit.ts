'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export function useMiniKit() {
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    // Check if MiniKit is installed
    const checkInstallation = () => {
      const installed = MiniKit.isInstalled()
      setIsInstalled(installed)
    }
    
    checkInstallation()
    
    // Set up an interval to periodically check installation status
    const intervalId = setInterval(checkInstallation, 1000)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  
  return {
    isInstalled,
    minikit: MiniKit
  }
} 