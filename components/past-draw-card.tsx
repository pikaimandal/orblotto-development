import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PastDrawCardProps {
  draw: {
    id: string
    amount: number
    drawDate: string
    ticketsSold: number
    firstPrize: number
  }
}

export function PastDrawCard({ draw }: PastDrawCardProps) {
  return (
    <Link href={`/draws/${draw.id}`}>
      <Card className="hover:bg-accent/20 transition-colors shadow-sm mb-2">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold flex items-center">
                ORB Lotto - ${draw.amount}
                <Badge variant="outline" className="ml-2">
                  {draw.amount === 500
                    ? "Jackpot"
                    : draw.amount === 100
                      ? "Mega"
                      : draw.amount === 10
                        ? "Super"
                        : draw.amount === 5
                          ? "Plus"
                          : draw.amount === 2
                            ? "Basic"
                            : "Basic"}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{formatDate(draw.drawDate)}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{draw.ticketsSold} tickets sold</div>
              <div className="flex items-center text-amber-500">
                <Trophy className="h-4 w-4 mr-1" />
                <span className="font-medium">${draw.firstPrize}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
