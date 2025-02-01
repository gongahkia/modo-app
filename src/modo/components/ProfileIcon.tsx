"use client"

import { useState } from "react"
import { User, Sun, Moon, UserX } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function ProfileIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, setTheme } = useTheme()
  const [visibility, setVisibility] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [newBlockedUser, setNewBlockedUser] = useState("")

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, we would upload this file to a server
      console.log("Profile picture changed:", file.name)
    }
  }

  const handleUsernameChange = (newUsername: string) => {
    // In a real app, we would send this to a server
    console.log("Username changed:", newUsername)
  }

  const handlePasswordChange = (newPassword: string) => {
    // In a real app, we would send this to a server
    console.log("Password changed:", newPassword)
  }

  const handleVisibilityChange = () => {
    setVisibility(!visibility)
    // In a real app, we would send this to a server
    console.log("Visibility changed:", !visibility)
  }

  const handleBlockUser = () => {
    if (newBlockedUser && !blockedUsers.includes(newBlockedUser)) {
      setBlockedUsers([...blockedUsers, newBlockedUser])
      setNewBlockedUser("")
      // In a real app, we would send this to a server
      console.log("User blocked:", newBlockedUser)
    }
  }

  const handleUnblockUser = (user: string) => {
    setBlockedUsers(blockedUsers.filter((u) => u !== user))
    // In a real app, we would send this to a server
    console.log("User unblocked:", user)
  }

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <User size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Profile Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="profile-picture">Profile Picture</Label>
            <Input id="profile-picture" type="file" accept="image/*" onChange={handleProfilePictureChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="New username" onChange={(e) => handleUsernameChange(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="New password"
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle">Theme</Label>
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === "dark" ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
              {theme === "dark" ? "Light" : "Dark"} Mode
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="visibility-toggle">Profile Visibility</Label>
            <Switch id="visibility-toggle" checked={visibility} onCheckedChange={handleVisibilityChange} />
          </div>

          <div className="space-y-2">
            <Label>Block Users</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username to block"
                value={newBlockedUser}
                onChange={(e) => setNewBlockedUser(e.target.value)}
              />
              <Button onClick={handleBlockUser} size="sm">
                Block
              </Button>
            </div>
            {blockedUsers.length > 0 && (
              <ul className="mt-2 space-y-1">
                {blockedUsers.map((user) => (
                  <li key={user} className="flex justify-between items-center">
                    <span>{user}</span>
                    <Button onClick={() => handleUnblockUser(user)} size="sm" variant="ghost">
                      <UserX size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

