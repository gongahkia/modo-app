"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CommentInputProps {
  onSubmit: (comment: string) => void
  onCancel: () => void
}

export function CommentInput({ onSubmit, onCancel }: CommentInputProps) {
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      onSubmit(comment.trim())
      setComment("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type your comment..."
        className="flex-grow"
      />
      <Button type="submit">Add</Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}