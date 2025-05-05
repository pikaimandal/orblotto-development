import { PastDrawCard } from "@/components/past-draw-card"
import { pastDraws } from "@/lib/data"
import { CircleDollarSign } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <CircleDollarSign className="h-7 w-7 mr-2 text-primary" />
        ORB Lotto
      </h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Past Draws</h2>

        <div className="space-y-2">
          {pastDraws.map((draw) => (
            <PastDrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      </div>
    </div>
  )
}
