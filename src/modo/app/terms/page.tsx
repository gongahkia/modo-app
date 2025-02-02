import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-4">
          <p>Welcome to Modo. By using our service, you agree to the following terms:</p>
          <h2 className="text-xl font-semibold">1. User Responsibilities</h2>
          <p>Users are responsible for all content they post and interactions they have on the platform.</p>
          <h2 className="text-xl font-semibold">2. Content Ownership</h2>
          <p>Users retain ownership of their content but grant Modo a license to use, distribute, and display it.</p>
          <h2 className="text-xl font-semibold">3. Prohibited Content</h2>
          <p>
            Users may not post illegal, harmful, or offensive content. Modo reserves the right to remove any content.
          </p>
          <h2 className="text-xl font-semibold">4. Privacy</h2>
          <p>We collect and use data as outlined in our Privacy Policy.</p>
          <h2 className="text-xl font-semibold">5. Termination</h2>
          <p>Modo reserves the right to terminate or suspend accounts for violations of these terms.</p>
        </div>
        <div className="mt-8 flex justify-between">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Agree and Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}