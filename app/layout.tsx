import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Retreat Planner",
  description: "Plan your next retreat with ease",
  authors: [{ name: "Russ Aulakh", url: "https://russ-aulakh.com" }],
  other: {
    linkedin: "https://www.linkedin.com/in/russ-aulakh/",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}

