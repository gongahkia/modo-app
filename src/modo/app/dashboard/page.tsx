"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Sketchbook from "@/components/Sketchbook"
import FollowingIcon from "@/components/FollowingIcon"
import ProfileIcon from "@/components/ProfileIcon"
import UploadDrawing from "@/components/UploadDrawing"

export default function Dashboard() {
  const [drawings, setDrawings] = useState([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleNewDrawing = (newDrawing) => {
    setDrawings((prevDrawings) => [newDrawing, ...prevDrawings])
  }

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-grow overflow-hidden">
        <Sketchbook drawings={drawings} />
      </main>
      <footer className="flex justify-between items-center p-4">
        <FollowingIcon />
        <UploadDrawing onUpload={handleNewDrawing} />
        <ProfileIcon />
      </footer>
    </div>
  )
}