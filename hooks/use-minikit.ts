'use client'

import { useEffect, useState, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

// Cache the result once we've detected the app to avoid UI flickering
let globalIsWorldAppDetected: boolean | null = null

export function useMiniKit() {
  const [isWorldApp, setIsWorldApp] = useState<boolean>(globalIsWorldAppDetected === true)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isDetecting, setIsDetecting] = useState<boolean>(globalIsWorldAppDetected === null)

  // Effect for detection
  useEffect(() => {
    // If we've already detected WorldApp globally, use that result
    if (globalIsWorldAppDetected !== null) {
      setIsWorldApp(globalIsWorldAppDetected)
      setIsReady(globalIsWorldAppDetected)
      setIsDetecting(false)
      return
    }

    // First immediate check
    const checkWorldApp = () => {
      try {
        // This is the officially documented way to check
        const installed = MiniKit.isInstalled()
        console.log('[MiniKit] isInstalled check result:', installed)
        
        if (installed) {
          globalIsWorldAppDetected = true
          setIsWorldApp(true)
          setIsReady(true)
          setIsDetecting(false)
        }
        return installed
      } catch (error) {
        console.error('[MiniKit] Error checking isInstalled:', error)
        return false
      }
    }

    // Initial check
    const isInstalledNow = checkWorldApp()
    
    // If not installed on first check, set up polling
    if (!isInstalledNow) {
      let attempts = 0
      const maxAttempts = 5
      
      // Poll a few more times with delay
      const interval = setInterval(() => {
        attempts++
        const detected = checkWorldApp()
        
        // Stop if detected or max attempts reached
        if (detected || attempts >= maxAttempts) {
          clearInterval(interval)
          
          // If we've tried all attempts and still not detected
          if (!detected && attempts >= maxAttempts) {
            globalIsWorldAppDetected = false
            setIsWorldApp(false)
            setIsReady(false) // Only set ready if we detected WorldApp
            setIsDetecting(false)
          }
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [])

  // Helper to execute MiniKit commands safely
  const executeCommand = useCallback(async <T>(fn: (minikit: typeof MiniKit) => Promise<T>): Promise<T> => {
    if (!isWorldApp || !isReady) {
      throw new Error('MiniKit is not ready or not in WorldApp')
    }
    
    try {
      return await fn(MiniKit)
    } catch (error) {
      console.error('[MiniKit] Command execution error:', error)
      throw error
    }
  }, [isWorldApp, isReady])

  return {
    isWorldApp,
    isReady,
    isDetecting,
    executeCommand
  }
}