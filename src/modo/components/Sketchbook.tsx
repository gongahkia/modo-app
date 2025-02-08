"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, FileCheck, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmojiBar } from "./EmojiBar"
import { CommentInput } from "./CommentInput"
import { getPosts, savePost, unsavePost, createInteraction, getPostInteractions } from "@/lib/api"

interface Drawing {
  id: string
  imageUrl: string
  author: string
  isGif?: boolean
}

interface Sticker {
  emoji: string
  x: number
  y: number
}

interface Comment {
  text: string
  x: number
  y: number
}

interface SketchbookProps {
  drawings: Drawing[]
  savedPosts: Drawing[]
  addSavedPost: (post: Drawing) => void
  removeSavedPost: (id: string) => void
}

const DRAWINGS_PER_PAGE = 6

export default function Sketchbook({ drawings, savedPosts, addSavedPost, removeSavedPost }: SketchbookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoomedDrawing, setZoomedDrawing] = useState<Drawing | null>(null)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  const sketchbookRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [drawingData, setDrawings] = useState<Drawing[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts()
        setDrawings(response.data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      }
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!zoomedDrawing) {
        if (e.deltaY > 0 && (currentPage + 1) * DRAWINGS_PER_PAGE < drawings.length) {
          setCurrentPage((prev) => prev + 1)
        } else if (e.deltaY < 0 && currentPage > 0) {
          setCurrentPage((prev) => prev - 1)
        }
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
  }, [currentPage, drawings.length, zoomedDrawing])

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    setIsAddingComment(false)
  }

  const handleCommentSelect = () => {
    setSelectedEmoji(null)
    setIsAddingComment(true)
  }

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      if (selectedEmoji) {
        try {
          await createInteraction({
            post_id: zoomedDrawing?.id,
            x_coordinate: Math.round(x),
            y_coordinate: Math.round(y),
            emoji: selectedEmoji,
          })
          setStickers([...stickers, { emoji: selectedEmoji, x, y }])
          setSelectedEmoji(null)
        } catch (error) {
          console.error("Error creating emoji interaction:", error)
        }
      } else if (isAddingComment) {
        setCommentPosition({ x, y })
      }
    }
  }

  const handleCommentSubmit = async (text: string) => {
    if (commentPosition && zoomedDrawing) {
      try {
        await createInteraction({
          post_id: zoomedDrawing.id,
          x_coordinate: Math.round(commentPosition.x),
          y_coordinate: Math.round(commentPosition.y),
          comment: text,
        })
        setComments([...comments, { text, x: commentPosition.x, y: commentPosition.y }])
        setIsAddingComment(false)
        setCommentPosition(null)
      } catch (error) {
        console.error("Error creating comment interaction:", error)
      }
    }
  }

  const handleCommentCancel = () => {
    setIsAddingComment(false)
    setCommentPosition(null)
  }

  const handleSavePost = async (drawing: Drawing) => {
    const isPostSaved = savedPosts.some((post) => post.id === drawing.id)
    try {
      if (isPostSaved) {
        await unsavePost(drawing.id)
        removeSavedPost(drawing.id)
      } else {
        await savePost(drawing.id)
        addSavedPost(drawing)
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)
    }
  }

  const fetchInteractions = async (drawingId: string) => {
    try {
      const response = await getPostInteractions(drawingId)
      const fetchedInteractions = response.data
      const newStickers = fetchedInteractions
        .filter((interaction: any) => interaction.emoji)
        .map((interaction: any) => ({
          emoji: interaction.emoji,
          x: interaction.x_coordinate,
          y: interaction.y_coordinate,
        }))
      const newComments = fetchedInteractions
        .filter((interaction: any) => interaction.comment)
        .map((interaction: any) => ({
          text: interaction.comment,
          x: interaction.x_coordinate,
          y: interaction.y_coordinate,
        }))
      setStickers(newStickers)
      setComments(newComments)
    } catch (error) {
      console.error("Error fetching interactions:", error)
    }
  }

  const renderImage = (drawing: Drawing, width: number, height: number) => {
    if (drawing.isGif) {
      return (
        <img
          src={drawing.imageUrl || "/placeholder.svg"}
          alt={`Drawing by ${drawing.author}`}
          width={width}
          height={height}
          className="object-cover shadow-md"
        />
      )
    } else {
      return (
        <Image
          src={drawing.imageUrl || "/placeholder.svg"}
          alt={`Drawing by ${drawing.author}`}
          width={width}
          height={height}
          className="object-cover shadow-md"
        />
      )
    }
  }

  if (drawings.length === 0) {
    return <div className="flex items-center justify-center h-full">No drawings found. Start by uploading one!</div>
  }

  const pageDrawings = drawings.slice(currentPage * DRAWINGS_PER_PAGE, (currentPage + 1) * DRAWINGS_PER_PAGE)

  return (
    <div ref={sketchbookRef} className="h-full w-full overflow-hidden bg-paper relative">
      <div className="relative w-full h-full transition-transform duration-500 ease-in-out">
        {pageDrawings.map((drawing, index) => (
          <div
            key={drawing.id}
            className="absolute transform rotate-random cursor-pointer"
            style={{
              top: `${Math.random() * 60 + 10}%`,
              left: `${Math.random() * 60 + 10}%`,
              transform: `rotate(${Math.random() * 20 - 10}deg)`,
              zIndex: index,
            }}
            onClick={() => {
              setZoomedDrawing(drawing)
              fetchInteractions(drawing.id)
            }}
          >
            <div className="relative">
              {renderImage(drawing, 288, 288)}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs">
                By {drawing.author}
              </div>
            </div>
          </div>
        ))}
      </div>
      {zoomedDrawing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="relative flex-grow" style={{ width: "100%", height: "700px" }}>
              <div ref={imageRef} className="relative cursor-crosshair w-full h-full" onClick={handleImageClick}>
                {zoomedDrawing.isGif ? (
                  <img
                    src={zoomedDrawing.imageUrl || "/placeholder.svg"}
                    alt={`Drawing by ${zoomedDrawing.author}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={zoomedDrawing.imageUrl || "/placeholder.svg"}
                    alt={`Drawing by ${zoomedDrawing.author}`}
                    layout="fill"
                    objectFit="contain"
                  />
                )}
                {stickers.map((sticker, index) => (
                  <div
                    key={`sticker-${index}`}
                    style={{
                      position: "absolute",
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: "24px",
                      pointerEvents: "none",
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}
                {comments.map((comment, index) => (
                  <div
                    key={`comment-${index}`}
                    style={{
                      position: "absolute",
                      left: `${comment.x}%`,
                      top: `${comment.y}%`,
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      maxWidth: "200px",
                      wordWrap: "break-word",
                    }}
                  >
                    {comment.text}
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white bg-opacity-75 hover:bg-opacity-100"
                onClick={() => handleSavePost(zoomedDrawing)}
              >
                {savedPosts.some((post) => post.id === zoomedDrawing.id) ? (
                  <FileCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <File className="h-6 w-6" />
                )}
              </Button>
            </div>
            <EmojiBar onEmojiSelect={handleEmojiSelect} onCommentSelect={handleCommentSelect} />
            {isAddingComment && commentPosition && (
              <div className="mt-4">
                <CommentInput onSubmit={handleCommentSubmit} onCancel={handleCommentCancel} />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => {
              setZoomedDrawing(null)
              setStickers([])
              setComments([])
              setSelectedEmoji(null)
              setIsAddingComment(false)
              setCommentPosition(null)
            }}
          >
            <X size={24} />
          </Button>
        </div>
      )}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded shadow">
        Page {currentPage + 1} of {Math.ceil(drawings.length / DRAWINGS_PER_PAGE)}
      </div>
    </div>
  )
}