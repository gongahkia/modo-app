"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { getSavedPosts, savePost, unsavePost } from "@/lib/api"

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

  const addSavedPost = async (post: SavedPost) => {
    try {
      await savePost(post.id)
      setSavedPosts((prevPosts) => {
        if (!prevPosts.some((p) => p.id === post.id)) {
          return [...prevPosts, post]
        }
        return prevPosts
      })
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const removeSavedPost = async (id: string) => {
    try {
      await unsavePost(id)
      setSavedPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))
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