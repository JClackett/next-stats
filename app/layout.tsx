import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { RepoForm } from "./repo-form"

const sansFont = Geist({ variable: "--font-sans", subsets: ["latin"] })
const monoFont = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const runtime = "edge"

export const metadata: Metadata = {
  title: "Rate My Next App",
  description: "Rate your Next.js repository.",
  openGraph: {
    title: "Rate My Next App",
    description: "Rate your Next.js repository.",
    images: ["https://rate-my-next.vercel.app/cover.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://rate-my-next.vercel.app/cover.png"],
  },
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sansFont.variable} ${monoFont.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <main className="container mx-auto max-w-3xl space-y-6 px-4 pt-4 pb-20 md:pt-16">
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <Link href="/">
                      <CardTitle>Rate My Next</CardTitle>
                    </Link>
                    <CardDescription className="font-mono">
                      Enter a GitHub repository URL to rate your Next.js repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RepoForm />
                  </CardContent>
                </Card>
              </div>
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
