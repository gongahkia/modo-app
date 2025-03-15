"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const emojis = ["😀", "😍", "🎨", "👍", "🔥", "💖", "🌟", "👏", "💬"]

interface EmojiBarProps {
  onEmojiSelect: (emoji: string) => void
  onCommentSelect: () => void
}

export function EmojiBar({ onEmojiSelect, onCommentSelect }: EmojiBarProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  const handleEmojiClick = (emoji: string) => {
    if (emoji === "💬") {
      onCommentSelect()
    } else {
      setSelectedEmoji(emoji)
      onEmojiSelect(emoji)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-center space-x-2 mb-2">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => handleEmojiClick(emoji)}
            className={`text-2xl ${selectedEmoji === emoji ? "bg-gray-200" : ""}`}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500">
        {selectedEmoji
          ? "Click on the image to place the emoji"
          : "Select an emoji or the speech bubble to add a comment"}
      </p>
    </div>
  )
}