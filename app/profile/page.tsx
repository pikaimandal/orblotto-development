"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Ticket, Trophy, LogOut, Loader2 } from "lucide-react"
import { formatWalletAddress } from "@/lib/utils"
import { useSupabase } from "@/contexts/SupabaseContext"
import { useWalletStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { getUserByWalletAddress, getUserTickets, getUserTransactions } from "@/utils/supabase-utils"
import type { Ticket as TicketType, Transaction } from "@/types/supabase"
import { toast } from "@/components/ui/use-toast"
import { useMiniKit } from "@/hooks/use-minikit"

export default function ProfilePage() {
  const { minikit, isReady: isMiniKitReady } = useMiniKit()
  const { isConnected, isConnecting, walletAddress, username, connectWallet, disconnectWallet } = useWalletStore()
  const { user, loading, signIn, signOut, refreshUser } = useSupabase()
  
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [winnings, setWinnings] = useState<Transaction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [totalTickets, setTotalTickets] = useState(0)
  const [totalWon, setTotalWon] = useState(0)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  
  // Effect to handle synchronization between wallet connection and Supabase auth
  useEffect(() => {
    const syncWalletWithSupabase = async () => {
      if (isConnected && walletAddress && !user && !loading && !isCreatingUser) {
        setIsCreatingUser(true);
        console.log('Wallet is connected but user not in Supabase, creating user...');
        
        try {
          // First check if user exists by wallet address
          // Normalize wallet address - strip out any dev mode text
          const normalizedWalletAddress = walletAddress
            .toLowerCase()
            .replace(/\s*\(dev\s*mode\)\s*/i, '')
            .trim();
          
          const existingUser = await getUserByWalletAddress(normalizedWalletAddress);
          
          if (existingUser) {
            console.log('User found by wallet address in database:', existingUser);
            // We'll use the signIn method to set the user in context
            await signIn(walletAddress, username || undefined);
          } else {
            // Create the user in Supabase using our updated context
            await signIn(walletAddress, username || undefined);
            console.log('User created in Supabase');
            
            // No need to manually set user as signIn will do it
            await refreshUser();
          }
        } catch (error) {
          console.error('Error synchronizing wallet with Supabase:', error);
          toast({
            title: "Authentication Error",
            description: "Failed to synchronize your wallet with your profile",
            variant: "destructive"
          });
        } finally {
          setIsCreatingUser(false);
        }
      }
    };

    syncWalletWithSupabase();
  }, [isConnected, walletAddress, user, loading, username, signIn, isCreatingUser, refreshUser]);

  // Connect wallet function using MiniKit
  const handleConnectWallet = async () => {
    try {
      if (isConnecting || isCreatingUser) {
        console.log('Already in connection process, ignoring duplicate request');
        return;
      }
      
      // Check if MiniKit is available
      if (isMiniKitReady && minikit) {
        console.log('Using MiniKit for wallet connection');
        
        // Request nonce from server
        const nonceRes = await fetch("/api/nonce");
        const { nonce } = await nonceRes.json();
        
        // Use walletAuth command to authenticate
        const { commandPayload, finalPayload } = await minikit.commandsAsync.walletAuth({
          nonce,
          requestId: "0",
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: "Sign in to ORB Lotto with your WorldApp wallet",
        });
        
        // Handle error from walletAuth
        if (finalPayload.status === "error") {
          console.error("Wallet auth error:", finalPayload);
          toast({
            title: "Authentication Failed",
            description: "Could not authenticate with WorldApp wallet",
            variant: "destructive"
          });
          return;
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
        });
        
        const verifyData = await verifyRes.json();
        
        if (verifyData.status === "error" || !verifyData.isValid) {
          console.error("Signature verification failed:", verifyData);
          toast({
            title: "Verification Failed",
            description: "Could not verify your wallet signature",
            variant: "destructive"
          });
          return;
        }
        
        // Get user's username from MiniKit if available
        let username = "worldapp_user"; // Default
        try {
          if (minikit.user?.username) {
            username = minikit.user.username;
          } else if (finalPayload.address) {
            // Try to get username by address
            const userData = await minikit.getUserByAddress(finalPayload.address);
            if (userData?.username) {
              username = userData.username;
            }
          }
        } catch (error) {
          console.warn("Could not fetch username:", error);
        }
        
        // Update wallet store with connected wallet info
        await connectWallet();
        
        // Use the store to sign in to Supabase
        await signIn(finalPayload.address, username);
      } else {
        // Fallback to regular connect when not in WorldApp
        console.log('MiniKit not ready, using fallback connection');
        await connectWallet();
      }
      
      // If we already have a user in context, refresh the data
      if (user) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect your wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Disconnect wallet function
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      await signOut();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Fetch user data when user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      setIsLoadingData(true);
      try {
        // Fetch tickets
        const userTickets = await getUserTickets(user.id);
        setTickets(userTickets);
        setTotalTickets(userTickets.length);
        
        // Fetch transactions that are winnings
        const userTransactions = await getUserTransactions(user.id);
        const winningTransactions = userTransactions.filter(
          transaction => transaction.transaction_type === 'winning' && transaction.status === 'completed'
        );
        setWinnings(winningTransactions);
        
        // Calculate total winnings
        const totalWinningsAmount = winningTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );
        setTotalWon(totalWinningsAmount);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Debug output to check state
  console.log('Profile state:', { 
    isConnected, 
    walletAddress,
    miniKitReady: isMiniKitReady,
    userLoaded: !!user, 
    loading, 
    isCreatingUser
  });

  // Determine if we're loading anything
  const isAnyLoading = loading || isConnecting || isCreatingUser;

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {(!isConnected || !user) ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your WorldWallet to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={handleConnectWallet} 
              className="gap-2"
              disabled={isAnyLoading}
            >
              {isAnyLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect WorldWallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{username ? `@${username}` : 'WorldApp User'}</CardTitle>
                  <CardDescription>Wallet: {formatWalletAddress(walletAddress)}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnectWallet} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-md text-center">
                  <div className="text-muted-foreground text-sm">Total Tickets</div>
                  <div className="text-2xl font-bold">{totalTickets}</div>
                </div>
                <div className="bg-muted p-3 rounded-md text-center">
                  <div className="text-muted-foreground text-sm">Total Won</div>
                  <div className="text-2xl font-bold text-amber-500">${totalWon.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tickets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="winnings">My Winnings</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="mt-4">
              {isLoadingData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono">
                                {ticket.ticket_numbers.join(' - ')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(ticket.created_at).toLocaleDateString()} - ${ticket.purchase_price}
                              </div>
                            </div>
                            <div>
                              <Ticket className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        You haven't purchased any tickets yet.
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="winnings" className="mt-4">
              {isLoadingData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.length > 0 ? (
                    winnings.map((winning) => (
                      <Card key={winning.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono">
                                Transaction ID: {winning.id.substring(0, 8)}...
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(winning.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                              <span className="font-medium">${winning.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        You haven't won any prizes yet. Keep trying!
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
