import Link from "next/link"
import { Button } from "@/components/ui/button"
import DynamicBackground from "@/components/DynamicBackground"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <DynamicBackground />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Modo</h1>
          <p className="text-2xl mb-8">Stop scrolling. Start creating.</p>
          <div className="space-x-4">
            <Button asChild className="bg-white text-black hover:bg-gray-200">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-white text-black hover:bg-gray-200">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}