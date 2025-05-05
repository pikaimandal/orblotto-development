import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import MiniKitProvider from "@/components/minikit-provider"
import { MinikitStatus } from "@/components/minikit-status"
import { SupabaseProvider } from "@/contexts/SupabaseContext"
import Script from "next/script"

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
      <head>
        {/* Add early initialization script to ensure MiniKit is available as soon as possible */}
        <Script id="minikit-early-init" strategy="beforeInteractive">
          {`
            // Early MiniKit initialization to ensure it's available before hydration
            window.__MINIKIT_APP_ID__ = "${process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID}";
            console.log("Early MiniKit initialization with App ID:", window.__MINIKIT_APP_ID__);
          `}
        </Script>
      </head>
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