'use client'

import { useEffect, useState, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

// Cache the detection result to avoid unnecessary recomputation
let globalIsInstalled: boolean | null = null

export function useMiniKit() {
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [isDetecting, setIsDetecting] = useState<boolean>(true)
  
  // Function to check if running in WorldApp
  const checkInstallStatus = useCallback(() => {
    try {
      // If we already detected it's installed, don't check again
      if (globalIsInstalled === true) {
        return true
      }
      
      // Check both initialization status and installation status
      const installed = MiniKit.isInstalled()
      const initialized = MiniKit._isInitialized
      
      // Debug logging
      console.log('MiniKit status check:', { installed, initialized })
      
      // Only set to ready if BOTH conditions are true
      const isReady = installed && initialized
      
      // Update global cache
      if (isReady) {
        globalIsInstalled = true
      }
      
      return isReady
    } catch (error) {
      console.error('Error checking MiniKit status:', error)
      return false
    }
  }, [])
  
  // Effect to continuously poll for installation status
  useEffect(() => {
    // Skip if already detected
    if (globalIsInstalled === true) {
      setIsReady(true)
      setIsInitialized(true)
      setIsDetecting(false)
      return
    }
    
    // Initial check
    const isInstalledNow = checkInstallStatus()
    setIsReady(isInstalledNow)
    setIsInitialized(MiniKit._isInitialized || false)
    
    // If not installed, set up polling
    if (!isInstalledNow) {
      // Use shorter interval for initial attempts, then slow down
      let attemptCount = 0
      const maxAttempts = 30 // Try for about 15 seconds at most
      
      const interval = setInterval(() => {
        attemptCount++
        const status = checkInstallStatus()
        setIsReady(status)
        setIsInitialized(MiniKit._isInitialized || false)
        
        // Stop polling if we detect it's installed or reach max attempts
        if (status || attemptCount >= maxAttempts) {
          setIsDetecting(false)
          clearInterval(interval)
        }
      }, attemptCount < 10 ? 500 : 1000) // Check every 0.5s initially, then every 1s
      
      return () => clearInterval(interval)
    } else {
      // Already installed, no need to poll
      setIsDetecting(false)
    }
  }, [checkInstallStatus])
  
  // We avoid returning the MiniKit directly and instead provide methods to use it
  // This ensures proper error handling when calling MiniKit methods
  return {
    isReady,
    isWorldApp: isReady,
    isInitialized,
    isDetecting,
    executeCommand: async <T>(
      commandFn: (minikit: typeof MiniKit) => Promise<T>
    ): Promise<T> => {
      if (!isReady) {
        throw new Error('MiniKit is not ready')
      }
      try {
        return await commandFn(MiniKit)
      } catch (error) {
        console.error('Error executing MiniKit command:', error)
        throw error
      }
    }
  }
}