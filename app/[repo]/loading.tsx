import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"
import { LoaderIcon } from "lucide-react"

export default function Page() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center gap-4 pt-6">
        <span className="text-muted-foreground">Analyzing</span>
        <LoaderIcon className="animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}
