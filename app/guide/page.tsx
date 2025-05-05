import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Ticket, Trophy, ShieldCheck, HeartHandshake, CheckCircle2, AlertTriangle, CreditCard, HelpCircle } from "lucide-react"

export default function GuidePage() {
  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">How ORB Lotto Works</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Prize Distribution
            </CardTitle>
            <CardDescription>How prizes are distributed for each draw</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong className="block">Prize Pool: 60%</strong>
                <p className="text-sm text-muted-foreground">
                  60% of all ticket sales go directly to the prize pool for winners.
                </p>
              </div>
              <div>
                <strong className="block">Foundation Contribution: 10%</strong>
                <p className="text-sm text-muted-foreground">
                  10% of ticket sales go to the WorldApp foundation for community development.
                </p>
              </div>
              <div>
                <strong className="block">Operations: 30%</strong>
                <p className="text-sm text-muted-foreground">
                  30% covers operational costs, including development and maintenance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              How to Buy Tickets
            </CardTitle>
            <CardDescription>Follow these steps to purchase your ORB Lotto tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal ml-5">
              <li>
                <strong>Connect your WorldWallet</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Connect WorldWallet" on the Buy Tickets page or Profile page.
                </p>
              </li>
              <li>
                <strong>Select your ticket type</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from ORB Lotto Basic ($2), Plus ($5), Super ($10), Mega ($100), or Jackpot ($500).
                </p>
              </li>
              <li>
                <strong>Enter the number of tickets</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Select how many tickets you want to purchase (up to 50 per transaction).
                </p>
              </li>
              <li>
                <strong>Choose payment currency</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Select whether to pay with WLD or USDC cryptocurrency.
                </p>
              </li>
              <li>
                <strong>Complete the payment</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Buy Tickets" and approve the transaction in your WorldApp wallet.
                </p>
              </li>
              <li>
                <strong>View your tickets</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  After successful payment, your tickets will appear in the "Your Tickets" section.
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  ORB Lotto is only available within the WorldApp environment. Make sure you're using the app within WorldApp.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  You must have sufficient funds (WLD or USDC) in your WorldWallet to complete transactions.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  Draws happen daily at 8:00 PM. Winners will be notified through the app.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>
                  All transactions are verified on-chain for complete transparency.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            How to Play
          </CardTitle>
          <CardDescription>Learn how to play ORB Lotto and win prizes</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="pl-2">
              <span className="font-medium">Connect your WorldWallet</span>
              <p className="text-sm text-muted-foreground ml-6">
                Use the WorldWallet authentication to connect your wallet to ORB Lotto.
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Choose your lottery</span>
              <p className="text-sm text-muted-foreground ml-6">
                Select from $2 (Basic), $5 (Plus), $10 (Super), $100 (Mega), or $500 (Jackpot) lotteries. Higher value
                lotteries have bigger prizes!
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Buy your tickets</span>
              <p className="text-sm text-muted-foreground ml-6">
                Purchase up to 50 tickets per draw. Each ticket has a unique number format: 15G 12902 (Two digits, one
                letter, space, five digits).
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Wait for the draw</span>
              <p className="text-sm text-muted-foreground ml-6">
                Draws happen daily at 8:00 PM. Results are published immediately after the draw.
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Check your winnings</span>
              <p className="text-sm text-muted-foreground ml-6">
                Visit your profile or the results page to see if you've won.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Prize Tiers
          </CardTitle>
          <CardDescription>Understanding how prizes are awarded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                1st Prize (Jackpot)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the entire ticket number (e.g., 93A 29521). Receives 50% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                2nd Tier (10 winners)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the last 5 digits of the winning number (e.g., 29521). Each winner receives 3% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-800" />
                3rd Tier (50 winners)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the last 4 digits of the winning number (e.g., 9521). Each winner receives 0.4% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md bg-primary/10">
              <h3 className="font-semibold flex items-center">
                <HeartHandshake className="h-4 w-4 mr-2 text-primary" />
                ORB Lotto Foundation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                10% of every prize pool goes to the ORB Lotto Foundation, which supports community projects and
                charitable causes within the Worldcoin ecosystem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            Transparency
          </CardTitle>
          <CardDescription>How we ensure fairness and transparency</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Random Number Generation</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto uses a verifiable random function (VRF) to generate winning numbers. The random number
                  generation process is publicly auditable and cannot be manipulated by any party, including us.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Prize Distribution</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  60% of all ticket sales go directly to the prize pool, 10% goes to the ORB Lotto Foundation, and the
                  remaining 30% covers operational costs and development. Prize distribution is automated and executed
                  by smart contracts on the Worldcoin network.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Public Records</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  All draw results, ticket sales, and prize distributions are recorded on the blockchain and publicly
                  accessible. You can verify any past draw and see all tickets purchased for complete transparency.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Audit Reports</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto undergoes regular security audits by independent third parties. Audit reports are published
                  on our website and accessible to all users.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <h3 className="font-semibold flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Our Commitment
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              We are committed to providing a fair, transparent, and enjoyable lottery experience. If you have any
              questions or concerns about our practices, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about using ORB Lotto</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>How do I pay for tickets?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm mb-2">
                  ORB Lotto uses WorldApp's built-in payment system. Here's what happens when you buy tickets:
                </p>
                <ol className="text-sm list-decimal ml-5 space-y-2">
                  <li>Select your ticket type and quantity on the Buy page</li>
                  <li>Choose your preferred currency (WLD or USDC)</li>
                  <li>Click "Buy Tickets" to initiate the payment</li>
                  <li>A WorldApp payment confirmation modal will appear</li>
                  <li>Review the payment details and confirm the transaction</li>
                  <li>After confirmation, your payment will be processed on-chain</li>
                  <li>Once verified, your tickets will be generated and appear in "Your Tickets"</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-2">
              <AccordionTrigger>What currencies can I use to buy tickets?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto currently accepts two cryptocurrencies for payments:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li><strong>WLD (Worldcoin)</strong> - The native token of the Worldcoin ecosystem</li>
                  <li><strong>USDC</strong> - A popular USD-pegged stablecoin</li>
                </ul>
                <p className="text-sm mt-2">
                  The app will automatically calculate the equivalent amount in your chosen currency based on current exchange rates.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-3">
              <AccordionTrigger>What happens if my payment fails?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  If your payment fails, no tickets will be generated and no funds will be deducted from your wallet. Common reasons for payment failures include:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li>Insufficient funds in your wallet</li>
                  <li>Network congestion or connectivity issues</li>
                  <li>Transaction rejected in your wallet</li>
                </ul>
                <p className="text-sm mt-2">
                  If you encounter persistent payment issues, please try:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li>Checking your wallet balance</li>
                  <li>Refreshing the app</li>
                  <li>Trying again with a smaller number of tickets</li>
                  <li>Switching to a different payment currency</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-4">
              <AccordionTrigger>How do I know if I've won?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  When the daily draw occurs (at 8:00 PM), all winning tickets are automatically identified in the system. You can check if you've won through:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li><strong>In-app notifications</strong> - Winners receive a notification directly in WorldApp</li>
                  <li><strong>Your Tickets section</strong> - Winning tickets will be highlighted with a badge</li>
                  <li><strong>Results page</strong> - Daily results are posted showing all winning numbers</li>
                </ul>
                <p className="text-sm mt-2">
                  Any prizes are automatically sent to the wallet address used to purchase the winning ticket.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-5">
              <AccordionTrigger>What are the odds of winning?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  The odds of winning depend on the total number of tickets sold for each draw:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li><strong>1st Prize (Jackpot)</strong> - 1 in total number of tickets (exact match)</li>
                  <li><strong>2nd Tier</strong> - 10 winners (matching last 5 digits)</li>
                  <li><strong>3rd Tier</strong> - 50 winners (matching last 4 digits)</li>
                </ul>
                <p className="text-sm mt-2">
                  The more tickets you purchase, the higher your chances of winning.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-6">
              <AccordionTrigger>How is the winning number generated?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto uses a verifiable random function (VRF) to generate winning numbers. This ensures:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li>Complete randomness - The number cannot be predicted</li>
                  <li>Transparency - The selection process is publicly auditable</li>
                  <li>Fairness - No party (including us) can manipulate the results</li>
                </ul>
                <p className="text-sm mt-2">
                  The random number generation occurs at exactly 8:00 PM daily, and the winning numbers are immediately published.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-7">
              <AccordionTrigger>Why do I need to use WorldApp?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto is designed specifically as a WorldApp Mini App, which offers several benefits:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li>Secure identity verification through World ID</li>
                  <li>Integrated wallet functionality for seamless payments</li>
                  <li>Human verification to prevent bot participation</li>
                  <li>Enhanced security features</li>
                  <li>Simplified user experience within the WorldApp ecosystem</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-8">
              <AccordionTrigger>What if I accidentally buy too many tickets?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  Once a ticket purchase transaction is confirmed on the blockchain, it cannot be reversed. We recommend:
                </p>
                <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
                  <li>Always double-check the quantity before confirming</li>
                  <li>Review the total amount in the payment confirmation screen</li>
                  <li>Start with smaller purchases if you're new to the app</li>
                </ul>
                <p className="text-sm mt-2">
                  The app limits purchases to 50 tickets per transaction to help prevent accidental large purchases.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
