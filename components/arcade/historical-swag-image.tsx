"use client"

/* eslint-disable @next/next/no-img-element */
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"

type HistoricalSwagImageProps = {
  src?: string
  alt: string
  className: string
  fallbackClassName?: string
}

export default function HistoricalSwagImage({
  src,
  alt,
  className,
  fallbackClassName = "h-8 w-8 text-slate-300 dark:text-slate-600",
}: HistoricalSwagImageProps) {
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
  }, [src])

  if (!src || failed) {
    return <Trophy className={fallbackClassName} aria-hidden="true" />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
