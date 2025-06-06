"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, Ticket, AlertCircle, LogOut, Loader2, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateTicketNumber, formatWalletAddress } from "@/lib/utils"
import { useWalletStore } from "@/lib/store"
import { useSupabase } from "@/contexts/SupabaseContext"
import { getUserByWalletAddress } from "@/utils/supabase-utils"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useMiniKit } from "@/hooks/use-minikit"

export default function BuyPage() {
  const { isReady: isMiniKitReady, executeCommand } = useMiniKit()
  const { isConnected, isConnecting, walletAddress, username, connectWallet, disconnectWallet } = useWalletStore()
  const { user, loading, signIn, refreshUser } = useSupabase()
  const [ticketCount, setTicketCount] = useState(1)
  const [selectedAmount, setSelectedAmount] = useState(2)
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([])
  const [currency, setCurrency] = useState<"WLD" | "USDC">("WLD")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Effect to handle synchronization between wallet connection and Supabase auth
  useEffect(() => {
    const syncWalletWithSupabase = async () => {
      if (isConnected && walletAddress && !user && !loading && !isCreatingUser) {
        setIsCreatingUser(true);
        console.log('Buy page: Wallet is connected but user not in Supabase, creating user...');
        
        try {
          // Normalize wallet address - strip out any dev mode text
          const normalizedWalletAddress = walletAddress
            .toLowerCase()
            .replace(/\s*\(dev\s*mode\)\s*/i, '')
            .trim();
          
          // Try to see if the user exists by wallet address first
          const existingUser = await getUserByWalletAddress(normalizedWalletAddress);
          
          if (existingUser) {
            console.log('Buy page: User found by wallet address in database:', existingUser);
            // Use the signIn method which will set the user internally
            await signIn(walletAddress, username);
            await refreshUser();
          } else {
            console.log('Buy page: Creating new user with wallet:', walletAddress);
            // Create the user in Supabase
            await signIn(walletAddress, username);
            
            // Refresh user data after creation
            await refreshUser();
          }
        } catch (error) {
          console.error('Buy page: Error synchronizing wallet with Supabase:', error);
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
  }, [isConnected, walletAddress, user, loading, username, signIn, refreshUser, isCreatingUser]);

  const getLottoTitle = (amount: number) => {
    switch (amount) {
      case 500:
        return "ORB Lotto Jackpot"
      case 100:
        return "ORB Lotto Mega"
      case 10:
        return "ORB Lotto Super"
      case 5:
        return "ORB Lotto Plus"
      default:
        return "ORB Lotto Basic"
    }
  }

  // Connect wallet function using MiniKit
  const handleConnectWallet = async () => {
    try {
      if (isConnecting || isCreatingUser) {
        console.log('Already in connection process, ignoring duplicate request');
        return;
      }
      
      // Check if MiniKit is available
      if (isMiniKitReady) {
        console.log('Using MiniKit for wallet connection');
        
        try {
          // Request nonce from server
          const nonceRes = await fetch("/api/nonce");
          const { nonce } = await nonceRes.json();
          
          // Use executeCommand for safer MiniKit usage
          const walletAuthResult = await executeCommand(async (minikit) => {
            return await minikit.commandsAsync.walletAuth({
              nonce,
              requestId: "0",
              expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
              notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              statement: "Sign in to ORB Lotto with your WorldApp wallet",
            });
          });
          
          const { finalPayload } = walletAuthResult;
          
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
            // Use executeCommand for safer MiniKit access
            const userInfo = await executeCommand(async (minikit) => {
              if (minikit.user?.username) {
                return { username: minikit.user.username };
              } else if (finalPayload.address) {
                const userData = await minikit.getUserByAddress(finalPayload.address);
                return userData || { username: null };
              }
              return { username: null };
            });
            
            if (userInfo?.username) {
              username = userInfo.username;
            }
          } catch (error) {
            console.warn("Could not fetch username:", error);
          }
          
          // Update wallet store with connected wallet info
          await connectWallet();
          
          // Use the store to sign in to Supabase
          await signIn(finalPayload.address, username);
          
        } catch (error) {
          console.error("Error during MiniKit wallet auth:", error);
          // Fall back to regular connect
          await connectWallet();
        }
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

  const handleBuyTickets = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsProcessing(true)
      
      // Check if MiniKit is available
      if (!isMiniKitReady) {
        toast({
          title: "WorldApp not detected",
          description: "This feature requires WorldApp to work properly",
          variant: "destructive"
        })
        
        if (process.env.NODE_ENV !== "production") {
          // Fall back to simulated mode for development
          simulateTicketGeneration()
        }
        
        setIsProcessing(false)
        return
      }
      
      // 1. Initialize payment in the backend
      const initRes = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticketCount,
          amount: selectedAmount,
          currency
        })
      })
      
      if (!initRes.ok) {
        const errorData = await initRes.json()
        throw new Error(errorData.error || "Failed to initiate payment")
      }
      
      const paymentData = await initRes.json()
      console.log("Payment initiated:", paymentData)
      
      // 2. Send payment command to World App - using executeCommand for better handling
      try {
        // Use executeCommand for safer MiniKit access
        const paymentResult = await executeCommand(async (minikit) => {
          return await minikit.commandsAsync.pay({
            reference: paymentData.paymentId,
            to: paymentData.recipientAddress,
            tokens: [{
              symbol: currency,
              token_amount: paymentData.amount.toString()
            }],
            description: `Purchase of ${ticketCount} ${getLottoTitle(selectedAmount)} tickets`
          });
        });
        
        const { finalPayload } = paymentResult;
        
        console.log("Payment result:", finalPayload);
        
        // 3. Error handling for payment failures
        if (!finalPayload || finalPayload.status === "error") {
          const errorPayload = finalPayload as any;
          const errorMessage = errorPayload?.error_message || errorPayload?.code || "Unknown payment error";
          console.error("Payment failed:", errorMessage);
          
          if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
            throw new Error("Insufficient funds to complete this transaction. Please add funds to your wallet.");
          } else if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
            throw new Error("Payment was rejected by the user.");
          } else {
            throw new Error(`Payment failed: ${errorMessage}`);
          }
        }
        
        // Store transaction ID for reference
        setTransactionId(finalPayload.transaction_id);
        
        // 4. Verify payment with backend
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            transactionId: finalPayload.transaction_id
          })
        });
        
        if (!verifyRes.ok) {
          const errorData = await verifyRes.json();
          throw new Error(errorData.error || "Failed to verify payment");
        }
        
        const verifyData = await verifyRes.json();
        
        // 5. Generate tickets after successful payment
        const tickets = verifyData.tickets?.map((t: any) => t.number) || 
          Array.from({ length: ticketCount }, () => generateTicketNumber());
          
        setGeneratedTickets(tickets);
        
        // Show success toast
        toast({
          title: "Purchase successful!",
          description: `You purchased ${ticketCount} ${getLottoTitle(selectedAmount)} tickets`,
          variant: "default"
        });
      } catch (error: any) {
        console.error("Payment command error:", error);
        
        // Specific error handling for payment issues
        if (error.message?.includes("user_rejected") || error.message?.includes("rejected")) {
          throw new Error("Payment was rejected by the user");
        } else if (error.message?.includes("insufficient") || error.message?.includes("balance")) {
          throw new Error("Insufficient funds to complete this transaction");
        } else {
          throw error;
        }
      }
      
    } catch (error: any) {
      console.error("Error purchasing tickets:", error);
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase tickets",
        variant: "destructive"
      });
      
      // Fallback for development only
      if (process.env.NODE_ENV !== "production") {
        simulateTicketGeneration();
      }
    } finally {
      setIsProcessing(false);
    }
  }
  
  // Fallback for development
  const simulateTicketGeneration = () => {
    const tickets = Array.from({ length: ticketCount }, () => generateTicketNumber())
    setGeneratedTickets(tickets)
  }

  // Determine if we're loading anything
  const isAnyLoading = loading || isConnecting || isCreatingUser;

  // Debug output to check state
  console.log('Buy page state:', { 
    isConnected, 
    walletAddress, 
    miniKitReady: isMiniKitReady,
    userLoaded: !!user, 
    loading, 
    isCreatingUser
  });

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Buy Tickets</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your WorldWallet to buy ORB Lotto tickets</CardDescription>
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
          <Alert className="mb-6">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div className="ml-2">
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription>
                    <div>Wallet: {formatWalletAddress(walletAddress)}</div>
                    {username && <div>Username: {username}</div>}
                  </AlertDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectWallet} className="gap-2">
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </Alert>

          <div className="grid gap-6">
            {generatedTickets.length > 0 ? (
            <Card>
              <CardHeader>
                  <CardTitle>Your Generated Tickets</CardTitle>
                <CardDescription>
                    These are your newly purchased ORB Lotto tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    {generatedTickets.map((ticket, index) => (
                      <div key={index} className="flex items-center p-2 border rounded-md bg-muted/50">
                        <Ticket className="h-4 w-4 mr-2 text-primary" />
                        <code className="font-mono">{ticket}</code>
                      </div>
                    ))}
                  </div>
                  {transactionId && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Transaction ID: <code className="font-mono">{transactionId}</code>
                    </div>
                  )}
              </CardContent>
              <CardFooter>
                  <Button className="w-full" onClick={() => setGeneratedTickets([])}>
                    Buy More Tickets
                </Button>
              </CardFooter>
            </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Buy ORB Lotto Tickets</CardTitle>
                  <CardDescription>Select your ticket type and quantity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ticket-type">Ticket Type</Label>
                      <Tabs 
                        defaultValue="2" 
                        className="mt-2"
                        onValueChange={(value) => setSelectedAmount(Number(value))}
                      >
                        <TabsList className="grid grid-cols-5 h-auto">
                          <TabsTrigger value="2" className="flex flex-col py-2 px-0 h-auto">
                            <span className="text-xs mb-1">Basic</span>
                            <Badge>$2</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="5" className="flex flex-col py-2 px-0 h-auto">
                            <span className="text-xs mb-1">Plus</span>
                            <Badge>$5</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="10" className="flex flex-col py-2 px-0 h-auto">
                            <span className="text-xs mb-1">Super</span>
                            <Badge>$10</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="100" className="flex flex-col py-2 px-0 h-auto">
                            <span className="text-xs mb-1">Mega</span>
                            <Badge>$100</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="500" className="flex flex-col py-2 px-0 h-auto">
                            <span className="text-xs mb-1">Jackpot</span>
                            <Badge>$500</Badge>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Number of Tickets</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1" 
                        max="50"
                        value={ticketCount}
                        onChange={(e) => setTicketCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span>Total Cost:</span>
                        <span className="font-bold">${ticketCount * selectedAmount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => {
                        setCurrency("WLD");
                        handleBuyTickets();
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && currency === "WLD" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4" />
                          Buy with WLD
                        </>
                      )}
                    </Button>
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => {
                        setCurrency("USDC");
                        handleBuyTickets();
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && currency === "USDC" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Buy with USDC
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Tickets will be randomly generated for the next available draw.
                  </p>
                </CardFooter>
              </Card>
            )}
            </div>
        </>
      )}
    </div>
  )
}
