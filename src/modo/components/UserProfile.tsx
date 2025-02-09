import { UserProfile } from "@clerk/nextjs"

const UserProfilePage = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <UserProfile />
  </div>
)

export default UserProfilePage