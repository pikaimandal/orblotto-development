'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Get app ID from environment variable
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID

    try {
      // Initialize MiniKit with app ID
      MiniKit.install(appId)
      
      // Log installation status and app ID for debugging
      console.log('MiniKit installed:', MiniKit.isInstalled())
      console.log('App ID:', appId)
      
      // Mark as initialized even if isInstalled() is false
      // This prevents multiple initialization attempts
      setInitialized(true)
      
      // Add a global flag that other components can check
      window.__MINIKIT_INITIALIZED__ = true
    } catch (error) {
      console.error('Error initializing MiniKit:', error)
      // Still mark as initialized to prevent infinite retries
      setInitialized(true)
    }
  }, [])

  return <>{children}</>
}