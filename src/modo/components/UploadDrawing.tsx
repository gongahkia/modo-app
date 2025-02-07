"use client"

import { useState, type React } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadDrawingProps {
  onUpload: () => void
}

const MAX_IMAGE_SIZE = 1200 // Maximum width or height in pixels

export default function UploadDrawing({ onUpload }: UploadDrawingProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      let imageUrl: string

      if (file.type === "image/gif") {
        // For GIFs, we don't resize to keep the animation
        imageUrl = URL.createObjectURL(file)
      } else {
        // For other image types, we scale down if necessary
        imageUrl = await scaleDownImage(file)
      }

      const newDrawing = {
        imageUrl: imageUrl,
        author: "Current User", // You might want to replace this with the actual user's name
        isGif: file.type === "image/gif",
      }

      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDrawing),
      })

      if (response.ok) {
        onUpload()
      } else {
        console.error("Error uploading drawing")
      }
    } catch (error) {
      console.error("Error uploading drawing:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const scaleDownImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_IMAGE_SIZE) {
              height *= MAX_IMAGE_SIZE / width
              width = MAX_IMAGE_SIZE
            }
          } else {
            if (height > MAX_IMAGE_SIZE) {
              width *= MAX_IMAGE_SIZE / height
              height = MAX_IMAGE_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL(file.type))
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div>
      <label htmlFor="upload-drawing">
        <Button variant="ghost" size="icon" asChild>
          <span>
            <Upload size={24} />
            <input
              id="upload-drawing"
              type="file"
              accept="image/*,image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </span>
        </Button>
      </label>
      {isUploading && <span className="ml-2">Uploading...</span>}
    </div>
  )
}