'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

// This component ensures MiniKit is properly initialized
export default function MinikitProviderComponent({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID

  // Use an effect to ensure consistent initialization even if the early init script didn't run
  useEffect(() => {
    try {
      // Check if MiniKit is already installed
      const isAlreadyInstalled = MiniKit.isInstalled()
      console.log('MiniKit initial isInstalled check:', isAlreadyInstalled)
      
      // Even if installed, ensure proper initialization
      MiniKit.install(appId)
      console.log('MiniKit initialized with appId:', appId)
      
      // Check again after explicit initialization
      console.log('MiniKit post-init isInstalled check:', MiniKit.isInstalled())
    } catch (error) {
      console.error('Error during MiniKit initialization:', error)
    }
  }, [appId])

  return (
    <MiniKitProvider appId={appId}>
      {children}
    </MiniKitProvider>
  )
}