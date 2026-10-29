"use client"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/actions/auth.actions"

const DemoBanner = () => {
  const router = useRouter()
  const handleCreateAccount = async () => {
    await signOut()
    router.push("/sign-up")
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-yellow-400/40 bg-gray-800/95 px-4 py-2 text-center text-sm text-gray-400 backdrop-blur">
      <span>You&apos;re exploring a demo account with sample data.</span>
      <button onClick={handleCreateAccount} className="cursor-pointer font-medium text-yellow-400 hover:underline">
        Create your own account
      </button>
    </div>
  )
}
export default DemoBanner
