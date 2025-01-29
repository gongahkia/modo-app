"use client"

import { useState } from "react"
import { User, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { auth, storage, db } from "@/lib/firebase"
import { updateProfile, updatePassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"

export default function ProfileIcon() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && auth.currentUser) {
      const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      await updateProfile(auth.currentUser, { photoURL: downloadURL })
      await updateDoc(doc(db, "users", auth.currentUser.uid), { profilePicture: downloadURL })
    }
  }

  const handleUsernameChange = async (newUsername: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newUsername })
      await updateDoc(doc(db, "users", auth.currentUser.uid), { username: newUsername })
    }
  }

  const handlePasswordChange = async (newPassword: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsExpanded(!isExpanded)} className="p-2">
        <User size={24} />
      </button>
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg">
          <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="block mb-2" />
          <input
            type="text"
            placeholder="New username"
            onChange={(e) => handleUsernameChange(e.target.value)}
            className="block mb-2"
          />
          <input
            type="password"
            placeholder="New password"
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="block mb-2"
          />
          <button onClick={toggleTheme} className="flex items-center">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="ml-2">Toggle Theme</span>
          </button>
        </div>
      )}
    </div>
  )
}

