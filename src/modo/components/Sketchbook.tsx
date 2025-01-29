"use client"

import React, { useState, useRef, useEffect } from "react"
import { collection, query, where, orderBy, limit, getDocs, type Timestamp } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import EmojiSticker from "./EmojiSticker"

interface Drawing {
  id: string
  imageUrl: string
  author: string
  createdAt: Timestamp
}

export default function Sketchbook() {
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const sketchbookRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDrawings()
  }, [])

  const fetchDrawings = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const drawingsRef = collection(db, "drawings")
      const q = query(drawingsRef, where("createdAt", ">=", today), orderBy("createdAt", "desc"), limit(50))

      const querySnapshot = await getDocs(q)
      const fetchedDrawings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Drawing[]

      setDrawings(fetchedDrawings)
    } catch (error) {
      console.error("Error fetching drawings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && currentPage < drawings.length - 1) {
        setCurrentPage((prev) => prev + 1)
      } else if (e.deltaY < 0 && currentPage > 0) {
        setCurrentPage((prev) => prev - 1)
      }
    }

    const sketchbook = sketchbookRef.current
    if (sketchbook) {
      sketchbook.addEventListener("wheel", handleWheel)
    }

    return () => {
      if (sketchbook) {
        sketchbook.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentPage, drawings.length])

  if (isLoading) {
    return <div>Loading drawings...</div>
  }

  if (drawings.length === 0) {
    return <div>No drawings found for today. Check back later or follow more users!</div>
  }

  return (
    <div ref={sketchbookRef} className="h-full w-full overflow-hidden">
      {drawings.map((drawing, index) => (
        <div
          key={drawing.id}
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
            index === currentPage ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <img
            src={drawing.imageUrl || "/placeholder.svg"}
            alt={`Drawing by ${drawing.author}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            By {drawing.author}
          </div>
          <EmojiSticker drawingId={drawing.id} />
        </div>
      ))}
    </div>
  )
}

