import { SignIn } from "@clerk/nextjs"

const SignInPage = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <SignIn />
  </div>
)

export default SignInPage