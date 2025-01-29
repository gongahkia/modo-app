import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm } from "formidable"
import { promises as fs } from "fs"
import path from "path"
import { storage, db, auth } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const form = new IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Error parsing form data" })
      }

      const file = files.file[0]
      const data = await fs.readFile(file.filepath)
      const fileName = `${Date.now()}-${file.originalFilename}`

      // Upload to Firebase Storage
      const storageRef = ref(storage, `drawings/${fileName}`)
      await uploadBytes(storageRef, data)
      const downloadURL = await getDownloadURL(storageRef)

      // Add drawing data to Firestore
      const drawingRef = await addDoc(collection(db, "drawings"), {
        userId: auth.currentUser?.uid,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
        stickers: [],
      })

      res
        .status(200)
        .json({ message: "Drawing uploaded successfully", drawing: { id: drawingRef.id, imageUrl: downloadURL } })
    })
  } catch (error) {
    console.error("Error uploading drawing:", error)
    res.status(500).json({ error: "Error uploading drawing" })
  }
}