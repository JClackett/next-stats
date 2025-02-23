import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RepoStats } from "@/lib/analyze-repo"
import { CheckIcon, FileCode2, Files, Layout, Network } from "lucide-react"
import { NumberTicker } from "./number-ticker"
import { ShareButton } from "./share-button"
import { Badge } from "./ui/badge"

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
    <Card>
      <div className="flex items-start justify-between">
        <CardHeader>
          <CardTitle className="font-bold text-3xl/6">{stats.repo}</CardTitle>
          <CardDescription>{stats.owner}</CardDescription>
        </CardHeader>
        <div className="p-6">
          <ShareButton />
        </div>
      </div>

      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          {stats.isTurbo && (
            <Badge variant="secondary">
              <CheckIcon size={12} /> Turbopack
            </Badge>
          )}
          {stats.isTailwind && (
            <Badge variant="secondary">
              <CheckIcon size={12} /> Tailwind
            </Badge>
          )}
          {stats.isPPR && (
            <Badge variant="secondary">
              <CheckIcon size={12} /> PPR
            </Badge>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="shadow-small">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <NumberTicker key={stats.repo} className="font-extrabold font-mono text-3xl" value={item.value} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
