"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
}

interface CommentSectionProps {
  drawingId: string
}

export function CommentSection({ drawingId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "Current User", // In a real app, this would be the logged-in user
        content: newComment.trim(),
        timestamp: new Date(),
      }
      setComments([...comments, comment])
      setNewComment("")
      console.log(`Comment added to drawing ${drawingId}:`, comment)
    }
  }

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Comments</h3>
      <div className="max-h-[200px] overflow-y-auto mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="mb-2">
            <p className="font-semibold">{comment.author}</p>
            <p>{comment.content}</p>
            <p className="text-xs text-gray-500">{comment.timestamp.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmitComment} className="flex">
        <Input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow mr-2"
        />
        <Button type="submit">Post</Button>
      </form>
    </div>
  )
}