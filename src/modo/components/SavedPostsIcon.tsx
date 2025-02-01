"use client"

import { useState } from "react"
import { Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SavedPost {
  id: string
  title: string
  author: string
}

export default function SavedPostsIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([
    { id: "1", title: "Amazing Sketch", author: "JohnDoe" },
    { id: "2", title: "Beautiful Landscape", author: "JaneSmith" },
    // In a real app, this would be fetched from a server
  ])

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Archive size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Saved Posts</h3>
          {savedPosts.length > 0 ? (
            <ul className="space-y-2">
              {savedPosts.map((post) => (
                <li key={post.id} className="flex justify-between items-center">
                  <span>
                    {post.title} by {post.author}
                  </span>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved posts yet.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

