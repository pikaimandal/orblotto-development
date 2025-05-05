'use client'

import { ReactNode } from 'react'
import { MiniKitProvider as WorldcoinMiniKitProvider } from '@worldcoin/minikit-react'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  // Get app ID from environment variable
  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID

  return (
    <WorldcoinMiniKitProvider appId={appId}>
      {children}
    </WorldcoinMiniKitProvider>
  )
}