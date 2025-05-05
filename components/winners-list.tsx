import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Winner {
  username: string
  ticketNumber: string
  prize: number
  tier: 1 | 2 | 3
}

interface WinnersListProps {
  winners: Winner[]
}

export function WinnersList({ winners }: WinnersListProps) {
  // Group winners by tier
  const tier1 = winners.filter((winner) => winner.tier === 1)
  const tier2 = winners.filter((winner) => winner.tier === 2)
  const tier3 = winners.filter((winner) => winner.tier === 3)

  return (
    <div className="space-y-6">
      {tier1.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-amber-500" />
            1st Prize Winners
          </h3>
          <div className="space-y-2">
            {tier1.map((winner, index) => (
              <WinnerCard key={index} winner={winner} />
            ))}
          </div>
        </div>
      )}

      {tier2.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-gray-400" />
            2nd Tier Winners ({tier2.length})
          </h3>
          <div className="space-y-2">
            {tier2.map((winner, index) => (
              <WinnerCard key={index} winner={winner} />
            ))}
          </div>
        </div>
      )}

      {tier3.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-amber-800" />
            3rd Tier Winners ({tier3.length})
          </h3>
          <div className="space-y-2">
            {tier3.slice(0, 5).map((winner, index) => (
              <WinnerCard key={index} winner={winner} />
            ))}
            {tier3.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">+ {tier3.length - 5} more winners</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function WinnerCard({ winner }: { winner: Winner }) {
  return (
    <Card>
      <CardContent className="p-3 flex justify-between items-center">
        <div>
          <p className="font-medium">@{winner.username}</p>
          <p className="text-sm text-muted-foreground">{winner.ticketNumber}</p>
        </div>
        <div className="text-right">
          <Badge variant={winner.tier === 1 ? "default" : winner.tier === 2 ? "secondary" : "outline"}>
            ${winner.prize}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
