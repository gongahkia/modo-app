import type { NextApiRequest, NextApiResponse } from "next"
import { db, auth } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!auth.currentUser) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const { drawingId, emoji, x, y } = req.body

    const drawingRef = doc(db, "drawings", drawingId)
    await updateDoc(drawingRef, {
      stickers: arrayUnion({ emoji, x, y }),
    })

    res.status(200).json({ message: "Sticker added successfully" })
  } catch (error) {
    console.error("Error adding sticker:", error)
    res.status(500).json({ error: "Error adding sticker" })
  }
}

