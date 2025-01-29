import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  await dbConnect()

  if (req.method === "POST") {
    try {
      const { userId, action } = req.body
      const currentUser = await User.findById(session.user.id)

      if (action === "follow" && !currentUser.following.includes(userId)) {
        currentUser.following.push(userId)
      } else if (action === "unfollow") {
        currentUser.following = currentUser.following.filter((id: string) => id.toString() !== userId)
      }

      await currentUser.save()

      res.status(200).json({ message: `User ${action}ed successfully` })
    } catch (error) {
      res.status(500).json({ error: `Error ${req.body.action}ing user` })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

