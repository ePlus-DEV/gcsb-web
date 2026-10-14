/** The seasonal window follows the visitor's calendar, as it did originally. */
export function isHalloweenSeason(date: Date) {
  const month = date.getMonth()
  return month === 9 || (month === 10 && date.getDate() <= 2)
}

export function isWidgetPath(pathname: string) {
  return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?widget\/?$/i.test(pathname)
}

export function shouldEnableHalloween(pathname: string, preference: string | null, date: Date) {
  return !isWidgetPath(pathname) && (
    preference === "halloween" || (preference !== "off" && isHalloweenSeason(date))
  )
}
