"use client"

import type { FormEvent } from "react"
import { BadgeCheck, CircleHelp, ExternalLink, LoaderCircle, RefreshCcw, Search, ShieldCheck, Sparkles, Trophy, X } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"

export type HeroCopy = { top: string; bottom: string; description: string }

type ProfileAnalyzerProps = {
  catalog: WebsiteCatalog
  copy?: HeroCopy
  profileUrl: string
  onProfileUrlChange: (value: string) => void
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void
  onReset: () => void
  hasResult: boolean
  loading: boolean
  error: string
}

/** Shared entry form for guest discovery and saved profiles. */
export default function ProfileAnalyzer({ catalog, copy, profileUrl, onProfileUrlChange, onAnalyze, onReset, hasResult, loading, error }: ProfileAnalyzerProps) {
  const messages = catalog.messages
  return (
    <section id="top" className={`arcade-hero${hasResult ? " has-profile" : ""}`} data-home-order="hero">
        <div className="hero-heading">
          <p className="pixel-kicker"><Sparkles /> {catalog.additional["__dashboard:programName"]}</p>
          <span className="halloween-edition">
            <span aria-hidden="true">🎃</span>
            {messages.halloweenEdition}
          </span>
          <h1>{copy?.top ?? messages.heroTitleTop}<br /><span>{copy?.bottom ?? messages.heroTitleBottom}</span></h1>
          <p className="hero-description">
            {copy?.description ?? messages.heroDescription}
          </p>
          <div className="trust-pills">
            <span><ShieldCheck /> {messages.publicDataOnly}</span>
            <span><BadgeCheck /> {messages.noSignIn}</span>
          </div>
        </div>

        <div id="calculator" className="profile-analyzer-card" aria-busy={loading}>
          <div className="analyzer-title"><span>1</span> {messages.pasteProfile}</div>
          <form onSubmit={onAnalyze} noValidate>
            <label className={error ? "profile-input has-error" : "profile-input"}>
              <Search />
              <input
                data-profile-url-input="true"
                type="url"
                inputMode="url"
                autoComplete="url"
                value={profileUrl}
                onChange={(event) => onProfileUrlChange(event.target.value)}
                placeholder="https://www.skills.google/my_account/profile/..."
                aria-label={messages.profileUrl}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "profile-analysis-error" : undefined}
              />
              {profileUrl && (
                <button type="button" aria-label={messages.clearProfileUrl} onClick={() => onProfileUrlChange("")}>
                  <X />
                </button>
              )}
            </label>
            <button className="analyze-button" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" /> : <Trophy />}
              {loading ? messages.analyzing : messages.analyzeProfile}
            </button>
          </form>
          {error && <p id="profile-analysis-error" className="analyzer-error" role="alert">{error}</p>}
          <div className="analyzer-help-row">
            <a href="https://www.skills.google/my_account/profile" target="_blank" rel="noreferrer">
              <CircleHelp /> {messages.findProfile} <ExternalLink />
            </a>
            {hasResult && (
              <button type="button" onClick={onReset}><RefreshCcw /> {messages.resetResult}</button>
            )}
          </div>
        </div>
    </section>
  )
}
