"use client"

import { useState } from "react"
import { Sketchbook } from "@/components/Sketchbook"
import FollowingIcon from "@/components/FollowingIcon"
import ProfileIcon from "@/components/ProfileIcon"
import UploadDrawing from "@/components/UploadDrawing"
import SavedPostsIcon from "@/components/SavedPostsIcon"

interface Drawing {
  id: string
  imageUrl: string
  author: string
  stickers: { emoji: string; x: number; y: number }[]
}

export default function Dashboard() {
  const [drawings, setDrawings] = useState<Drawing[]>([])

/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Add a new drawing to the top of the list of drawings
   * @param {Drawing} newDrawing The new drawing to add
   */
/******  71ddd4ef-daa3-4f9a-9465-5cffd7c746e6  *******/
  const handleNewDrawing = (newDrawing: Drawing) => {
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