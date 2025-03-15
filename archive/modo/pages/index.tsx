"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@clerk/nextjs"
import LandingPage from "./landing"

export default function Home() {
  const { isLoaded, userId, sessionId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/login")
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) {
    return null
  }

  return <LandingPage />
}