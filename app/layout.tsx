import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import MiniKitProvider from "@/components/minikit-provider"
import { MinikitStatus } from "@/components/minikit-status"
import { SupabaseProvider } from "@/contexts/SupabaseContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ORB Lotto",
  description: "A transparent lottery system on Worldcoin's WorldApp",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background min-h-screen`}>
        <MiniKitProvider>
          <SupabaseProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
              <div className="flex flex-col min-h-screen max-w-md mx-auto border-x border-border">
                <Navbar />
                <main className="flex-1">{children}</main>
                <MinikitStatus />
              </div>
            </ThemeProvider>
          </SupabaseProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}


import './globals.css'