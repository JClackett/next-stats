import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RepoStats } from "@/lib/analyze-repo"
import { FileCode2, Files, Layout, Network } from "lucide-react"

interface StatsDisplayProps {
  stats: RepoStats
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const items = [
    {
      title: "Pages",
      value: stats.pages,
      icon: Layout,
    },
    {
      title: "Components",
      value: stats.components,
      icon: FileCode2,
    },
    {
      title: "API Routes",
      value: stats.apiRoutes,
      icon: Network,
    },
    {
      title: "Total Files",
      value: stats.totalFiles,
      icon: Files,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
