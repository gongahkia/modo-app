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
      const { code } = req.query
      if (typeof code !== "string" || code.length !== 6) {
        return res.status(400).json({ error: "Invalid user code" })
      }

      const users = await User.find({ userCode: code }).select("_id username userCode")
      const currentUser = await User.findById(session.user.id)

      const usersWithFollowStatus = users.map((user) => ({
        id: user._id,
        username: user.username,
        userCode: user.userCode,
        isFollowing: currentUser.following.includes(user._id),
      }))

      res.status(200).json(usersWithFollowStatus)
    } catch (error) {
      res.status(500).json({ error: "Error searching for users" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

