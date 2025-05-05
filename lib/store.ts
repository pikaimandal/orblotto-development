import { create } from "zustand"
import { MiniKit } from "@worldcoin/minikit-js"

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
      
      // Check if MiniKit is installed
      if (!MiniKit.isInstalled()) {
        console.error("MiniKit not installed or not running in WorldApp")
        // Fallback for development/testing
        set({
          isConnected: true,
          isConnecting: false,
          walletAddress: "0x1a2b...3c4d (Dev Mode)",
          username: "orbuser42",
          totalTickets: 37,
          totalWon: 125,
        })
        return
      }
      
      // Request nonce from server
      const nonceRes = await fetch("/api/nonce")
      const { nonce } = await nonceRes.json()
      
      // Use walletAuth command to authenticate
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "Sign in to ORB Lotto with your WorldApp wallet",
      })
      
      // Handle error from walletAuth
      if (finalPayload.status === "error") {
        console.error("Wallet auth error:", finalPayload)
        set({ isConnecting: false })
        return
      }
      
      // Verify the signature on backend
      const verifyRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })
      
      const verifyData = await verifyRes.json()
      
      if (verifyData.status === "error" || !verifyData.isValid) {
        console.error("Signature verification failed:", verifyData)
        set({ isConnecting: false })
        return
      }
      
      // Get user's username from MiniKit if available
      let username = "worldapp_user" // Default
      try {
        if (MiniKit.user?.username) {
          username = MiniKit.user.username
        } else if (finalPayload.address) {
          // Try to get username by address
          const userData = await MiniKit.getUserByAddress(finalPayload.address)
          if (userData?.username) {
            username = userData.username
          }
        }
      } catch (error) {
        console.warn("Could not fetch username:", error)
      }
      
      // Set wallet information
      set({
        isConnected: true,
        isConnecting: false,
        walletAddress: finalPayload.address,
        username,
        totalTickets: 0,
        totalWon: 0,
      })
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
