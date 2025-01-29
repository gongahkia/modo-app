"use client"

import type React from "react"
import { useState } from "react"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

const emojis = ["😀", "😍", "🎨", "👍", "🔥", "💖", "🌟", "👏"]

interface EmojiStickerProps {
  drawingId: string
}

interface Sticker {
  emoji: string
  x: number
  y: number
}

export default function EmojiSticker({ drawingId }: EmojiStickerProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [stickers, setStickers] = useState<Sticker[]>([])

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
  }

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedEmoji) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newSticker = { emoji: selectedEmoji, x, y }
      setStickers([...stickers, newSticker])
      setSelectedEmoji(null)

      try {
        const drawingRef = doc(db, "drawings", drawingId)
        await updateDoc(drawingRef, {
          stickers: arrayUnion(newSticker),
        })
      } catch (error) {
        console.error("Error adding sticker:", error)
      }
    }
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full" onClick={handleCanvasClick}>
      <div className="absolute top-4 left-4 bg-white bg-opacity-75 rounded p-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiSelect(emoji)}
            className={`text-2xl mx-1 ${selectedEmoji === emoji ? "border-2 border-blue-500" : ""}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      {stickers.map((sticker, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${sticker.x}px`,
            top: `${sticker.y}px`,
            fontSize: "24px",
          }}
        >
          {sticker.emoji}
        </div>
      ))}
    </div>
  )
}

