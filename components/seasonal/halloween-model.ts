/** Auto-enable for October 1–31 in the visitor's local calendar. */
export function isHalloweenSeason(date: Date) {
  const month = date.getMonth()
  return month === 9
}

export function isWidgetPath(pathname: string) {
  return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?widget\/?$/i.test(pathname)
}

export function shouldEnableHalloween(pathname: string, preference: string | null, date: Date) {
  return !isWidgetPath(pathname) && (
    preference === "halloween" || (preference !== "off" && isHalloweenSeason(date))
  )
}
