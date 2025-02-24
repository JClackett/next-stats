import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RepoData } from "@/lib/analyze-repo"
import { CheckIcon, ChevronLeftIcon, FileCode2, Files, Layout, Network } from "lucide-react"
import Link from "next/link"
import { NumberTicker } from "./number-ticker"
import { ShareButton } from "./share-button"
import { Badge } from "./ui/badge"

interface StatsDisplayProps {
  data: RepoData
}

export function StatsDisplay({ data }: StatsDisplayProps) {
  const items = [
    {
      title: "Pages",
      value: data.stats.pages,
      icon: Layout,
    },
    {
      title: "Components",
      value: data.stats.components,
      icon: FileCode2,
    },
    {
      title: "API Routes",
      value: data.stats.apiRoutes,
      icon: Network,
    },
    {
      title: "Total Files",
      value: data.stats.totalFiles,
      icon: Files,
    },
  ]

  return (
    <Card>
      <div className="flex items-start justify-between">
        <CardHeader>
          <div className="flex flex-row items-center gap-2">
            <Link href="/">
              <ChevronLeftIcon size={20} />
            </Link>
            <CardTitle className="font-bold text-3xl/6">{data.info.repo}</CardTitle>
          </div>
          <CardDescription>{data.info.owner}</CardDescription>
        </CardHeader>

        <div className="flex flex-row items-center gap-2 pt-6 pr-6">
          <span className="text-muted-foreground">Score</span>
          <NumberTicker key={data.info.repo} className="font-extrabold font-mono text-3xl" value={data.stats.score} />
        </div>
      </div>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {data.stats.isTurbo && (
              <Badge variant="secondary">
                <CheckIcon size={12} /> Turbopack
              </Badge>
            )}
            {data.stats.isTailwind && (
              <Badge variant="secondary">
                <CheckIcon size={12} /> Tailwind
              </Badge>
            )}
            {data.stats.isPPR && (
              <Badge variant="secondary">
                <CheckIcon size={12} /> PPR
              </Badge>
            )}
          </div>
          <ShareButton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="shadow-small">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <NumberTicker key={data.info.repo} className="font-extrabold font-mono text-3xl" value={item.value} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
