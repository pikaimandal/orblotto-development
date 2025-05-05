import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface Ticket {
  username: string
  ticketNumber: string
  isWinner?: boolean
  tier?: 1 | 2 | 3
}

interface TicketsListProps {
  tickets: Ticket[]
}

export function TicketsList({ tickets }: TicketsListProps) {
  return (
    <div className="space-y-2">
      {tickets.map((ticket, index) => (
        <Card key={index}>
          <CardContent className="p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">@{ticket.username}</p>
              <p className="text-sm text-muted-foreground">{ticket.ticketNumber}</p>
            </div>
            {ticket.isWinner && (
              <div>
                <Trophy
                  className={`h-5 w-5 ${
                    ticket.tier === 1 ? "text-amber-500" : ticket.tier === 2 ? "text-gray-400" : "text-amber-800"
                  }`}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
