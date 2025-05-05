import { notFound } from "next/navigation"
import { pastDraws, getDrawDetails } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WinnersList } from "@/components/winners-list"
import { TicketsList } from "@/components/tickets-list"

export default function DrawDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const draw = pastDraws.find((draw) => draw.id === params.id)

  if (!draw) {
    notFound()
  }

  const drawDetails = getDrawDetails(params.id)

  const getLottoType = (amount: number) => {
    switch (amount) {
      case 500:
        return "Jackpot"
      case 100:
        return "Mega"
      case 10:
        return "Super"
      case 5:
        return "Plus"
      case 2:
        return "Basic"
      default:
        return "Basic"
    }
  }

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Draw Details</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              ORB Lotto - ${draw.amount}
              <Badge variant="outline" className="ml-2">
                {getLottoType(draw.amount)}
              </Badge>
            </div>
            <div className="text-sm font-normal text-muted-foreground">{formatDate(draw.drawDate)}</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tickets Sold</p>
              <p className="font-medium">{draw.ticketsSold}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Prize Pool</p>
              <p className="font-medium">${draw.ticketsSold * draw.amount * 0.6}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Winning Number</p>
              <p className="font-medium text-amber-500">{drawDetails.winningNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Foundation Contribution</p>
              <p className="font-medium text-primary">${draw.ticketsSold * draw.amount * 0.1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="winners">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="winners">Winners</TabsTrigger>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="winners" className="mt-4">
          <WinnersList winners={drawDetails.winners} />
        </TabsContent>
        <TabsContent value="tickets" className="mt-4">
          <TicketsList tickets={drawDetails.tickets} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
