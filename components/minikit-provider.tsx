'use client'

import { ReactNode } from 'react'
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

export default function MiniKitWrapperComponent({ children }: { children: ReactNode }) {
  // Get app ID from environment variable
  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID

  return (
    <MiniKitProvider appId={appId}>
      {children}
    </MiniKitProvider>
  )
}