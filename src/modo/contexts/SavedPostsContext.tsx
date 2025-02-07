import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

interface SavedPost {
  id: string
  imageUrl: string
  author: string
  isGif?: boolean
}

interface SavedPostsContextType {
  savedPosts: SavedPost[]
  addSavedPost: (post: SavedPost) => Promise<void>
  removeSavedPost: (id: string) => Promise<void>
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined)

export function SavedPostsProvider({ children }: { children: ReactNode }) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])

  useEffect(() => {
    fetchSavedPosts()
  }, [])

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch("/api/saved_posts")
      if (response.ok) {
        const data = await response.json()
        setSavedPosts(data)
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error)
    }
  }

  const addSavedPost = async (post: SavedPost) => {
    try {
      const response = await fetch("/api/saved_posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      })
      if (response.ok) {
        const newPost = await response.json()
        setSavedPosts((prevPosts) => [...prevPosts, newPost])
      }
    } catch (error) {
      console.error("Error adding saved post:", error)
    }
  }

  const removeSavedPost = async (id: string) => {
    try {
      const response = await fetch(`/api/saved_posts/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setSavedPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))
      }
    } catch (error) {
      console.error("Error removing saved post:", error)
    }
  }

  return (
    <SavedPostsContext.Provider value={{ savedPosts, addSavedPost, removeSavedPost }}>
      {children}
    </SavedPostsContext.Provider>
  )
}

export function useSavedPosts() {
  const context = useContext(SavedPostsContext)
  if (context === undefined) {
    throw new Error("useSavedPosts must be used within a SavedPostsProvider")
  }
  return context
}