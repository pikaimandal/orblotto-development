import { create } from "zustand"

interface WalletState {
  isConnected: boolean
  walletAddress: string
  username: string
  totalTickets: number
  totalWon: number
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

// This store is used along with the useMiniKit hook from @/hooks/use-minikit
// The actual MiniKit instance is accessed through that hook in components
export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  walletAddress: "",
  username: "",
  totalTickets: 0,
  totalWon: 0,
  isConnecting: false,
  
  connectWallet: async () => {
    try {
      set({ isConnecting: true })
      
      // The actual wallet connection is now handled in the component 
      // using the useMiniKit hook from @worldcoin/minikit-react
      
      // Request nonce from server
      const nonceRes = await fetch("/api/nonce")
      const { nonce } = await nonceRes.json()
      
      // Actual authentication will be done in the component using the hook
      // and then the component will call the following to update the state
      
      // DEV MODE FALLBACK - component will use real data when available
      if (process.env.NODE_ENV === 'development') {
        // This is only used if the component can't get real data from MiniKit
        set({
          isConnected: true,
          isConnecting: false,
          walletAddress: "0x1a2b...3c4d (Dev Mode)",
          username: "orbuser42",
          totalTickets: 37,
          totalWon: 125,
        })
      } else {
        // Reset connecting state 
        set({ isConnecting: false })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // Reset connecting state
      set({ isConnecting: false })
    }
  },
  
  disconnectWallet: () => {
    // No official disconnect method in MiniKit, just reset state
    set({
      isConnected: false,
      walletAddress: "",
      username: "",
      totalTickets: 0,
      totalWon: 0,
    })
  },
}))
