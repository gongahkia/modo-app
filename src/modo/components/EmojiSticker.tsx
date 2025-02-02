"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

const emojis = ["😀", "😍", "🎨", "👍", "🔥", "💖", "🌟", "👏"]

interface EmojiStickerProps {
  drawingId: string
  imageWidth: number
  imageHeight: number
}

interface Sticker {
  emoji: string
  x: number
  y: number
}

export default function EmojiSticker({ drawingId, imageWidth, imageHeight }: EmojiStickerProps) {
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedEmoji && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= 0 && x <= imageWidth && y >= 0 && y <= imageHeight) {
        setStickers((prevStickers) => [...prevStickers, { emoji: selectedEmoji, x, y }])
        console.log(`Sticker added to drawing ${drawingId}:`, { emoji: selectedEmoji, x, y })
        setSelectedEmoji(null) // Clear the selected emoji after placement
      }
    }
  }

  return (
    <div className="relative" style={{ width: `${imageWidth}px`, height: `${imageHeight + 50}px` }}>
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full"
        style={{ height: `${imageHeight}px` }}
        onClick={handleImageClick}
      >
        {stickers.map((sticker, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              fontSize: "24px",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            {sticker.emoji}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-75 p-2 flex justify-center">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation() // Prevent the click from bubbling to the image
              handleEmojiClick(emoji)
            }}
            className={`text-2xl mx-1 ${selectedEmoji === emoji ? "bg-gray-200" : ""}`}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}