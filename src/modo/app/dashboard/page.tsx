"use client"

import { useState } from "react"
import Sketchbook from "@/components/Sketchbook"
import FollowingIcon from "@/components/FollowingIcon"
import ProfileIcon from "@/components/ProfileIcon"
import UploadDrawing from "@/components/UploadDrawing"
import SavedPostsIcon from "@/components/SavedPostsIcon"

export default function Dashboard() {
  const [drawings, setDrawings] = useState([])

  const handleNewDrawing = (newDrawing) => {
    setDrawings((prevDrawings) => [newDrawing, ...prevDrawings])
  }

  return (
    <div className="h-screen flex flex-col bg-paper">
      <main className="flex-grow overflow-hidden">
        <Sketchbook drawings={drawings} />
      </main>
      <footer className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <FollowingIcon />
        <UploadDrawing onUpload={handleNewDrawing} />
        <SavedPostsIcon />
        <ProfileIcon />
      </footer>
    </div>
  )
}