"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const emojis = ["😀", "😍", "🎨", "👍", "🔥", "💖", "🌟", "👏"]

interface EmojiStickerProps {
  drawingId: string
  onAddSticker: (emoji: string, x: number, y: number) => void
}

export function EmojiSticker({ drawingId, onAddSticker }: EmojiStickerProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji)
  }

  return (
    <div className="mt-4">
      <div className="flex justify-center space-x-2 bg-white p-2 rounded-md shadow-md">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant={selectedEmoji === emoji ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleEmojiClick(emoji)}
            className="text-2xl"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}