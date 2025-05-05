'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Get app ID from environment variable
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID

    // Initialize MiniKit with app ID
    MiniKit.install(appId)
    
    // Log installation status and app ID for debugging
    console.log('MiniKit installed:', MiniKit.isInstalled())
    console.log('App ID:', appId)
  }, [])

  return <>{children}</>
} 