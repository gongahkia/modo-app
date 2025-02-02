"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmojiSticker } from "./EmojiSticker"
import { CommentSection } from "./CommentSection"

interface Sticker {
  emoji: string
  x: number
  y: number
}

interface Drawing {
  id: string
  imageUrl: string
  author: string
  stickers: Sticker[]
}

interface SketchbookProps {
  drawings: Drawing[]
}

const DRAWINGS_PER_PAGE = 6

export function Sketchbook({ drawings: initialDrawings }: SketchbookProps) {
  const [drawings, setDrawings] = useState<Drawing[]>(initialDrawings)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoomedDrawing, setZoomedDrawing] = useState<Drawing | null>(null)
  const sketchbookRef = useRef<HTMLDivElement>(null)
  const zoomedImageRef = useRef<HTMLDivElement>(null)

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

  const handleAddSticker = (emoji: string, x: number, y: number) => {
    if (zoomedDrawing && zoomedImageRef.current) {
      const rect = zoomedImageRef.current.getBoundingClientRect()
      const relativeX = (x / rect.width) * 100
      const relativeY = (y / rect.height) * 100

      setDrawings((prevDrawings) =>
        prevDrawings.map((drawing) =>
          drawing.id === zoomedDrawing.id
            ? { ...drawing, stickers: [...drawing.stickers, { emoji, x: relativeX, y: relativeY }] }
            : drawing,
        ),
      )

      setZoomedDrawing((prevZoomed) =>
        prevZoomed
          ? { ...prevZoomed, stickers: [...prevZoomed.stickers, { emoji, x: relativeX, y: relativeY }] }
          : null,
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
            onClick={() => setZoomedDrawing(drawing)}
          >
            <div className="relative">
              <Image
                src={drawing.imageUrl || "/placeholder.svg"}
                alt={`Drawing by ${drawing.author}`}
                width={288}
                height={288}
                className="object-cover shadow-md"
              />
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
            <div className="relative flex-grow" ref={zoomedImageRef}>
              <Image
                src={zoomedDrawing.imageUrl || "/placeholder.svg"}
                alt={`Drawing by ${zoomedDrawing.author}`}
                layout="fill"
                objectFit="contain"
              />
              {zoomedDrawing.stickers.map((sticker, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: "24px",
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}
            </div>
            <EmojiSticker drawingId={zoomedDrawing.id} onAddSticker={handleAddSticker} />
            <CommentSection drawingId={zoomedDrawing.id} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setZoomedDrawing(null)}
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

