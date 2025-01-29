"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { storage, db, auth } from "@/lib/firebase"

interface UploadDrawingProps {
  onUpload: (newDrawing: any) => void
}

export default function UploadDrawing({ onUpload }: UploadDrawingProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `drawings/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Add drawing data to Firestore
      const drawingRef = await addDoc(collection(db, "drawings"), {
        userId: user.uid,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
        stickers: [],
      })

      const newDrawing = {
        id: drawingRef.id,
        imageUrl: downloadURL,
        author: user.displayName || user.email,
        createdAt: new Date(),
      }

      onUpload(newDrawing)
    } catch (error) {
      console.error("Error uploading drawing:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label htmlFor="upload-drawing" className="cursor-pointer">
        <Upload size={24} />
        <input
          id="upload-drawing"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>
      {isUploading && <span>Uploading...</span>}
    </div>
  )
}

