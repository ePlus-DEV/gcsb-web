"use client"

import { useEffect, useState } from "react"
import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import { getWebsiteLocaleInfo } from "@/lib/website-i18n"
import type { SlotHistoryFeed } from "./slot-history"
import { mergeObservations, predictTier, validObservation, type ScoreCheck, type TierObservation } from "./tier-prediction"

const names: Record<number, string> = { 120: "Legend", 95: "Champion", 75: "Ranger", 50: "Trooper" }
export default function TierPredictionPanel({ profileUrl, check, feed, catalog, locale, estimatedBonus }: {
  profileUrl: string; check: ScoreCheck | null; feed: SlotHistoryFeed | null
  catalog: WebsiteCatalog; locale: WebsiteLocale; estimatedBonus: boolean
}) {
  const [history, setHistory] = useState<TierObservation[]>([])
  const [historyKey, setHistoryKey] = useState("")
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [clearedAt, setClearedAt] = useState<string | null>(null)
  const key = `arcade-tier-evidence-v1:2026:${profileUrl.trim().replace(/\/$/, "")}`
  const text = (id: string) => catalog.additional[`__prediction:${id}`] ?? ""
  const snapshot = check ? [...(feed?.snapshots ?? [])].reverse().find(x => x.at <= check.at && !x.source) : undefined
  const observation: TierObservation | null = check ? {
    ...check, version: 1, season: 2026, slotsAt: snapshot?.at ?? null,
    slots: snapshot?.tiers.map(({ points, spotsLeft }) => ({ points, spotsLeft })) ?? [],
  } : null

  useEffect(() => {
    let saved: TierObservation[] = []
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")
      if (Array.isArray(raw) && raw.length <= 44) saved = raw.filter(validObservation)
      setStorageAvailable(true)
    } catch { setStorageAvailable(false) }
    if (observation && observation.at !== clearedAt) saved = mergeObservations(saved, observation)
    setHistory(saved)
    setHistoryKey(key)
    if (observation && observation.at !== clearedAt) {
      try { localStorage.setItem(key, JSON.stringify(saved)) } catch { setStorageAvailable(false) }
    }
    // The observation is immutable for a check; only its paired feed can arrive later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, check?.at, snapshot?.at, clearedAt])

  const prediction = check ? predictTier(check, historyKey === key ? history : [], observation) : null
  const htmlLang = getWebsiteLocaleInfo(locale).htmlLang
  const formatDate = (date: string) => new Intl.DateTimeFormat(htmlLang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date))
  const formatDuration = (minutes: number) => new Intl.NumberFormat(htmlLang, {
    style: "unit", unit: minutes >= 60 ? "hour" : "minute",
    unitDisplay: "long", maximumFractionDigits: 1,
  }).format(minutes >= 60 ? minutes / 60 : minutes)
  return (
    <details className="tier-prediction">
      <summary>{text("title")}</summary>
      <p>{text("rule")}</p>
      {!prediction ? <p>{text("checkFirst")}</p> : <>
        <strong>{text(prediction.state)}</strong>
        {prediction.scoreTier !== null && <p>{text("scoreTier").replace("{tier}", names[prediction.scoreTier])}</p>}
        {prediction.supportedTier !== null && prediction.evidenceAt && <p>{text("evidence").replace("{tier}", names[prediction.supportedTier]).replace("{date}", formatDate(prediction.evidenceAt))}</p>}
        {prediction.evidenceLagMinutes !== null && prediction.supportedTier !== null && <p>{text("evidenceLag").replace("{duration}", formatDuration(prediction.evidenceLagMinutes))}</p>}
        {prediction.targetObservedFull && prediction.scoreTier !== null && <p className="tier-prediction-warning">{text("possible").replace("{tier}", names[prediction.scoreTier])}</p>}
        {prediction.fallbackTier !== null && prediction.fallbackTier !== prediction.scoreTier && <p>{text("scenario").replace("{tier}", names[prediction.fallbackTier])}</p>}
        {prediction.allEligibleFull && <p>{text("noOpenSlots")}</p>}
        {prediction.slotLagMinutes !== null && <p>{text(prediction.slotLagMinutes > 48 * 60 ? "staleSnapshot" : "crawlLag").replace("{duration}", formatDuration(prediction.slotLagMinutes))}</p>}
        <p>{text("noPercent")}</p>
      </>}
      {estimatedBonus && <p>{text("bonus")}</p>}
      {snapshot && <p>{catalog.dynamic.lastUpdated.replace("{value}", formatDate(snapshot.at))}</p>}
      {historyKey === key && history.length > 0 && <ul className="tier-prediction-checks">
        {history.slice(-5).reverse().map(item => <li key={item.at}>
          <time dateTime={item.at}>{formatDate(item.at)}</time>{" · "}
          {catalog.messages.arcadePoints}{": "}{new Intl.NumberFormat(getWebsiteLocaleInfo(locale).htmlLang).format(item.points)}{" · "}
          {item.complete ? catalog.messages.complete : catalog.messages.review}
        </li>)}
      </ul>}
      <p>{text(storageAvailable ? "storage" : "storageFailed")}</p>
      {historyKey === key && history.length > 0 && <button type="button" onClick={() => {
        try { localStorage.removeItem(key) } catch { setStorageAvailable(false) }
        setHistory([]); setClearedAt(check?.at ?? null)
      }}>{text("clear")}</button>}
      <a href="https://discuss.google.dev/t/riding-the-waterfall-in-the-cloud/402709" target="_blank" rel="noreferrer">{text("source")}</a>
    </details>
  )
}
