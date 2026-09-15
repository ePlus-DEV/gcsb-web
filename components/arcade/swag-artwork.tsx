"use client"

import { Gift } from "lucide-react"
import { useEffect, useState } from "react"

export default function SwagArtwork({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Gift className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
