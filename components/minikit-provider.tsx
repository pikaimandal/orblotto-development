'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialization code for MiniKit as per official docs 
    // https://docs.world.org/mini-apps/quick-start/installing
    
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID
    
    // Manual initialization at the component level
    try {
      // Check if we're already initialized to prevent duplicate initialization
      const isAlreadyInitialized = MiniKit._isInitialized
      
      if (!isAlreadyInitialized) {
        console.log('Initializing MiniKit with app ID:', appId)
        MiniKit.install(appId)
      }
      
      // Log installation status for debugging
      console.log('MiniKit installed status:', MiniKit.isInstalled())
      console.log('MiniKit initialized status:', MiniKit._isInitialized)
    } catch (error) {
      console.error('Error initializing MiniKit:', error)
    }
  }, [])

  return <>{children}</>
}