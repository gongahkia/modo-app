"use client"

import { useState, useEffect } from "react"
import { Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchProfiles, getFollowing, followProfile, unfollowProfile } from "@/lib/api"

interface User {
  id: string
  username: string
  userCode: string
}

export default function FollowingIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [followedUsers, setFollowedUsers] = useState<User[]>([])

  const handleSearch = async () => {
    try {
      const response = await searchProfiles(searchQuery)
      setSearchResults(response.data)
    } catch (error) {
      console.error("Error searching profiles:", error)
    }
  }

  const handleFollowToggle = async (user: User) => {
    try {
      if (followedUsers.some((u) => u.id === user.id)) {
        await unfollowProfile(user.id)
        setFollowedUsers(followedUsers.filter((u) => u.id !== user.id))
      } else {
        await followProfile(user.id)
        setFollowedUsers([...followedUsers, user])
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const response = await getFollowing()
        setFollowedUsers(response.data)
      } catch (error) {
        console.error("Error fetching followed users:", error)
      }
    }
    fetchFollowedUsers()
  }, [])

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
        <Users size={24} />
      </Button>
      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg w-64">
          <div className="flex items-center mb-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter 6-digit code"
              className="mr-2"
            />
            <Button onClick={handleSearch} size="icon">
              <Search size={20} />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Search Results</h3>
              <ul>
                {searchResults.map((user) => (
                  <li key={user.id} className="flex items-center justify-between mb-2">
                    <span>{user.username}</span>
                    <Button
                      onClick={() => handleFollowToggle(user)}
                      variant={followedUsers.some((u) => u.id === user.id) ? "destructive" : "default"}
                      size="sm"
                    >
                      {followedUsers.some((u) => u.id === user.id) ? "Unfollow" : "Follow"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h3 className="font-bold mt-4 mb-2">Following</h3>
          <ul>
            {followedUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between mb-2">
                <span>{user.username}</span>
                <Button onClick={() => handleFollowToggle(user)} variant="destructive" size="sm">
                  Unfollow
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}