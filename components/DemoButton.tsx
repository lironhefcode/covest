"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { startDemo } from "@/lib/actions/demo.actions"

const DemoButton = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    const res = await startDemo()
    if (res.success) {
      window.location.href = "/"
      return
    }
    toast.error(res.error || "Could not start the demo. Please try again.")
    setIsLoading(false)
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">or</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isLoading}
        className="h-12 w-full cursor-pointer rounded-lg border-yellow-400/60 bg-transparent text-base font-medium text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
      >
        {isLoading ? "Preparing demo..." : "Try the demo — no sign-up"}
      </Button>
    </div>
  )
}
export default DemoButton
