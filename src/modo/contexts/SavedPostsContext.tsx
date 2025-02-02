"use client";

import { createContext, useState, useContext, type ReactNode } from "react"

interface SavedPost {
  id: string
  imageUrl: string
  author: string
  isGif?: boolean
}

interface SavedPostsContextType {
  savedPosts: SavedPost[]
  addSavedPost: (post: SavedPost) => void
  removeSavedPost: (id: string) => void
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined)

export function SavedPostsProvider({ children }: { children: ReactNode }) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])

  const addSavedPost = (post: SavedPost) => {
    setSavedPosts((prevPosts) => {
      if (!prevPosts.some((p) => p.id === post.id)) {
        return [...prevPosts, post]
      }
      return prevPosts
    })
  }

  const removeSavedPost = (id: string) => {
    setSavedPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))
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