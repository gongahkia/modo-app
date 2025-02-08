"use client"

import { useState, useCallback } from "react"
import { UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { blacklistProfile, removeFromBlacklist } from "@/lib/api"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ProfileIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibility, setVisibility] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [newBlockedUser, setNewBlockedUser] = useState("")
  const [profilePicture, setProfilePicture] = useState("/placeholder-user.jpg")
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(reader.result as string)
        setIsCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = useCallback(async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      setProfilePicture(croppedImage)
      setIsCropperOpen(false)
      // In a real app, we would upload this cropped image to a server
      console.log("Profile picture changed and cropped")
    }
  }, [imageSrc, croppedAreaPixels])

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

  const handleBlockUser = async () => {
    if (newBlockedUser) {
      try {
        await blacklistProfile(newBlockedUser)
        setBlockedUsers([...blockedUsers, newBlockedUser])
        setNewBlockedUser("")
      } catch (error) {
        console.error("Error blocking user:", error)
      }
    }
  }

  const handleUnblockUser = async (user: string) => {
    try {
      await removeFromBlacklist(user)
      setBlockedUsers(blockedUsers.filter((u) => u !== user))
    } catch (error) {
      console.error("Error unblocking user:", error)
    }
  }

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profilePicture} alt="Profile picture" />
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profilePicture} alt="Profile picture" />
            </Avatar>
          </div>
          <h3 className="font-semibold text-lg text-center">Profile Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="profile-picture" className="sr-only">
              Profile Picture
            </Label>
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById("profile-picture")?.click()}
              variant="outline"
              className="w-full"
            >
              Change Profile Picture
            </Button>
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

      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Popover>
  )
}

// Helper function to crop the image
async function getCroppedImg(imageSrc: string, pixelCrop: CropArea): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"))
        return
      }
      resolve(URL.createObjectURL(blob))
    }, "image/jpeg")
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}