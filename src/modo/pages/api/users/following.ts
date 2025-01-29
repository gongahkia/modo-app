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

  if (req.method === "GET") {
    try {
      const currentUser = await User.findById(session.user.id).populate("following", "username userCode")

      const followedUsers = currentUser.following.map((user: any) => ({
        id: user._id,
        username: user.username,
        userCode: user.userCode,
        isFollowing: true,
      }))

      res.status(200).json(followedUsers)
    } catch (error) {
      res.status(500).json({ error: "Error fetching followed users" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

