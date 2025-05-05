"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Ticket, User, BookOpen } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Buy Tickets",
      href: "/buy",
      icon: Ticket,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Guide",
      href: "/guide",
      icon: BookOpen,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
