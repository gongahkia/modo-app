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
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (emoji: string, e: React.DragEvent) => {
    setDraggingEmoji(emoji)
    e.dataTransfer.setDragImage(new Image(), 0, 0) // Hide the default drag image
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (containerRef.current && draggingEmoji) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= 0 && x <= imageWidth && y >= 0 && y <= imageHeight) {
        setStickers([...stickers, { emoji: draggingEmoji, x, y }])
        console.log(`Sticker added to drawing ${drawingId}:`, { emoji: draggingEmoji, x, y })
      }
    }
    setDraggingEmoji(null)
  }

  return (
    <div className="mb-4">
      <div className="flex justify-center mb-2">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            draggable
            onDragStart={(e) => handleDragStart(emoji, e)}
            onDragEnd={handleDragEnd}
            className="text-2xl mx-1 cursor-grab"
          >
            {emoji}
          </Button>
        ))}
      </div>
      <div ref={containerRef} className="relative w-full h-[400px] border border-gray-300 overflow-hidden">
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
        {draggingEmoji && (
          <div
            style={{
              position: "fixed",
              left: "-1000px",
              top: "-1000px",
              fontSize: "24px",
            }}
          >
            {draggingEmoji}
          </div>
        )}
      </div>
    </div>
  )
}

