import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SavedPostsProvider } from "@/contexts/SavedPostsContext"
import type React from "react" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modo",
  description: "Stop scrolling. Start creating.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <SavedPostsProvider>{children}</SavedPostsProvider>
      </body>
    </html>
  )
}