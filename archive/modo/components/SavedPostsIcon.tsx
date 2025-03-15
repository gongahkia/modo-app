"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSavedPosts } from "@/lib/api"

export default function SavedPostsIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [savedPosts, setSavedPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const response = await getSavedPosts()
        setSavedPosts(response.data)
      } catch (error) {
        console.error("Error fetching saved posts:", error)
      }
    }
    fetchSavedPosts()
  }, [])

  const renderImage = (post: any) => {
    if (post.isGif) {
      return (
        <img
          src={post.imageUrl || "/placeholder.svg"}
          alt={`Saved post by ${post.author}`}
          className="rounded-md object-cover w-full h-[180px]"
        />
      )
    } else {
      return (
        <Image
          src={post.imageUrl || "/placeholder.svg"}
          alt={`Saved post by ${post.author}`}
          width={180}
          height={180}
          className="rounded-md object-cover w-full h-[180px]"
        />
      )
    }
  }

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Archive size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <div className="p-4 bg-background">
          <h3 className="font-semibold text-lg mb-2">Saved Posts</h3>
          {savedPosts.length > 0 ? (
            <ScrollArea className="h-[400px] w-full">
              <div className="grid grid-cols-2 gap-4">
                {savedPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    {renderImage(post)}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-end justify-center">
                      <p className="text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        by {post.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground">No saved posts yet.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}