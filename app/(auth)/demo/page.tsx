"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { startDemo } from "@/lib/actions/demo.actions"

const DemoPage = () => {
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true
    startDemo().then((res) => {
      if (res.success) {
        window.location.href = "/"
        return
      }
      setError(res.error || "Could not start the demo. Please try again.")
    })
  }, [])

  return (
    <>
      <h1 className="form-title">Live demo</h1>
      {error ? (
        <div className="space-y-4 text-gray-400">
          <p>{error}</p>
          <Link href="/sign-in" className="text-yellow-400 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner />
          <p>Setting up a demo account with a sample watchlist, alerts and group...</p>
        </div>
      )}
    </>
  )
}

export default DemoPage
