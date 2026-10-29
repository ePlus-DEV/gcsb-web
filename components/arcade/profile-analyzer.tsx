"use client"

import type { FormEventHandler } from "react"
import { CircleHelp, ExternalLink, LoaderCircle, RefreshCcw, Search, Trophy, X } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"

type Props = {
  catalog: WebsiteCatalog
  value: string
  onChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onReset: () => void
  loading: boolean
  error: string
  hasResult: boolean
}

/** Keeps enhancer/portal anchors stable while sharing accessible form states. */
export default function ProfileAnalyzer({ catalog, value, onChange, onSubmit, onReset, loading, error, hasResult }: Props) {
  const copy = catalog.messages
  return <div id="calculator" className="profile-analyzer-card">
    <label className="analyzer-title" htmlFor="arcade-profile-url"><span aria-hidden="true">{1}</span>{copy.pasteProfile}</label>
    <form onSubmit={onSubmit} noValidate aria-busy={loading}>
      <div className={error ? "profile-input has-error" : "profile-input"}>
        <Search aria-hidden="true" />
        <input data-arcade-profile-input="true" id="arcade-profile-url" type="url" inputMode="url" autoComplete="url" value={value}
          onChange={event => onChange(event.target.value)} placeholder={copy.profileUrl}
          aria-invalid={Boolean(error)} aria-describedby={error ? "arcade-profile-error" : undefined} />
        {value && <button type="button" aria-label={copy.clearProfileUrl} onClick={() => onChange("")}><X /></button>}
      </div>
      <button className="analyze-button" type="submit" disabled={loading}>
        {loading ? <LoaderCircle className="spin" /> : <Trophy />}
        {loading ? copy.analyzing : copy.analyzeProfile}
      </button>
    </form>
    {error && <p id="arcade-profile-error" className="analyzer-error" role="alert">{error}</p>}
    <div className="analyzer-help-row">
      <a href="https://www.skills.google/my_account/profile" target="_blank" rel="noreferrer"><CircleHelp />{copy.findProfile}<ExternalLink /></a>
      {hasResult && <button type="button" onClick={onReset}><RefreshCcw />{copy.resetResult}</button>}
    </div>
  </div>
}
