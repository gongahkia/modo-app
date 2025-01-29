"use client"

import { useState, useEffect } from "react"
import { Users, Search } from "lucide-react"
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

interface User {
  id: string
  username: string
  userCode: string
}

export default function FollowingIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [followedUsers, setFollowedUsers] = useState<User[]>([])

  useEffect(() => {
    fetchFollowedUsers()
  }, [])

  const fetchFollowedUsers = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDocs(userRef)
      const userData = userDoc.data()

      if (userData && userData.following) {
        const followedUsersData = await Promise.all(
          userData.following.map(async (userId: string) => {
            const followedUserDoc = await getDocs(doc(db, "users", userId))
            const followedUserData = followedUserDoc.data()
            return {
              id: userId,
              username: followedUserData?.username,
              userCode: followedUserData?.userCode,
            }
          }),
        )
        setFollowedUsers(followedUsersData)
      }
    } catch (error) {
      console.error("Error fetching followed users:", error)
    }
  }

  const handleSearch = async () => {
    if (searchQuery.length !== 6) {
      alert("Please enter a 6-digit code")
      return
    }

    setIsSearching(true)

    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("userCode", "==", searchQuery))
      const querySnapshot = await getDocs(q)

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]

      setSearchResults(results)
    } catch (error) {
      console.error("Error searching for users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFollowToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      const userRef = doc(db, "users", user.uid)

      if (isCurrentlyFollowing) {
        await updateDoc(userRef, {
          following: arrayRemove(userId),
        })
        setFollowedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      } else {
        await updateDoc(userRef, {
          following: arrayUnion(userId),
        })
        const newFollowedUser = searchResults.find((user) => user.id === userId)
        if (newFollowedUser) {
          setFollowedUsers((prevUsers) => [...prevUsers, newFollowedUser])
        }
      }
    } catch (error) {
      console.error(`Error ${isCurrentlyFollowing ? "unfollowing" : "following"} user:`, error)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsExpanded(!isExpanded)} className="p-2">
        <Users size={24} />
      </button>
      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter 6-digit code"
              className="border rounded p-1 mr-2"
            />
            <button onClick={handleSearch} className="p-1" disabled={isSearching}>
              <Search size={20} />
            </button>
          </div>
          {isSearching && <div>Searching...</div>}
          {searchResults.length > 0 && (
            <ul className="mt-2">
              {searchResults.map((user) => (
                <li key={user.id} className="flex items-center justify-between mb-2">
                  <span>{user.username}</span>
                  <button
                    onClick={() => handleFollowToggle(user.id, false)}
                    className={`px-2 py-1 rounded ${false ? "bg-red-500" : "bg-blue-500"} text-white`}
                  >
                    {false ? "Unfollow" : "Follow"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-4 mb-2 font-bold">Following</h3>
          <ul>
            {followedUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between mb-2">
                <span>{user.username}</span>
                <button
                  onClick={() => handleFollowToggle(user.id, true)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Unfollow
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

