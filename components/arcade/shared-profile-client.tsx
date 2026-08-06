"use client"

import {
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  Share,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  API_URL,
  OFFICIAL_MILESTONES,
  type ArcadeApiResponse,
  type ArcadeBadge,
  formatNumber,
  numeric,
  tierRangeLabel,
} from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REQUEST_TIMEOUT_MS = 20_000
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ArcadeApiResponse; profileUrl: string }

function safeHttpsUrl(value?: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function getDashboardHref(): string {
  if (typeof window === "undefined") return `${BASE_PATH}/`

  const pathname = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const first = pathname.split("/").filter(Boolean)[0]
  const locale = first && first !== "profile" ? `/${first}` : ""

  return `${BASE_PATH}${locale}/`
}

function getTierProgress(points: number) {
  const current = [...OFFICIAL_MILESTONES]
    .reverse()
    .find((tier) => points >= tier.points) ?? null
  const next = OFFICIAL_MILESTONES.find((tier) => points < tier.points) ?? null
  const lower = current?.points ?? 0
  const upper = next?.points ?? current?.points ?? 1
  const progress = next
    ? Math.min(100, Math.max(0, ((points - lower) / Math.max(1, upper - lower)) * 100))
    : 100

  return {
    current,
    next,
    progress,
    remaining: next ? Math.max(0, next.points - points) : 0,
  }
}

function SharedProfileStyles() {
  return <style>{`
    .public-profile-page {
      --shared-surface: rgba(9, 15, 36, .78);
      --shared-surface-strong: rgba(14, 22, 50, .94);
      --shared-surface-soft: rgba(255, 255, 255, .045);
      --shared-border: rgba(148, 163, 255, .16);
      --shared-border-strong: rgba(124, 92, 255, .34);
      --shared-text: #f8fafc;
      --shared-muted: rgba(203, 213, 225, .7);
      --shared-purple: #8b6cff;
      --shared-cyan: #42d9ff;
      --shared-gold: #f5c451;
      min-height: 100vh;
      color: var(--shared-text);
      background:
        radial-gradient(circle at 8% 6%, rgba(81, 64, 214, .22), transparent 28%),
        radial-gradient(circle at 92% 14%, rgba(16, 185, 214, .16), transparent 26%),
        linear-gradient(180deg, #050918 0%, #080d20 48%, #050817 100%);
      position: relative;
      isolation: isolate;
      overflow-x: hidden;
    }
    .public-profile-page::before,
    .public-profile-page::after {
      content: "";
      position: fixed;
      z-index: -1;
      pointer-events: none;
      filter: blur(18px);
      opacity: .75;
    }
    .public-profile-page::before {
      width: 440px;
      height: 440px;
      left: -220px;
      top: 38vh;
      border-radius: 50%;
      border: 90px solid rgba(124, 92, 255, .08);
    }
    .public-profile-page::after {
      width: 360px;
      height: 360px;
      right: -180px;
      bottom: 4vh;
      border-radius: 50%;
      background: rgba(35, 196, 226, .06);
    }
    .public-profile-page .arcade-stars { opacity: .34; }
    .public-profile-page .arcade-header {
      position: sticky;
      top: 0;
      z-index: 30;
      width: min(1180px, calc(100% - 2rem));
      margin: 0 auto;
      padding: .9rem 0;
      background: rgba(5, 9, 24, .72);
      border-bottom: 1px solid rgba(148, 163, 255, .1);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }
    .public-profile-page .arcade-nav {
      border: 1px solid rgba(148, 163, 255, .12);
      border-radius: 999px;
      padding: .25rem;
      background: rgba(255, 255, 255, .03);
    }
    .public-profile-page .arcade-nav a {
      border-radius: 999px;
      padding: .5rem .85rem;
    }
    .public-profile-page .arcade-nav a.active {
      background: rgba(124, 92, 255, .14);
      color: #dcd5ff;
    }
    .public-profile-page .header-store-link {
      border: 1px solid rgba(124, 92, 255, .36);
      background: linear-gradient(135deg, rgba(124, 92, 255, .9), rgba(58, 108, 255, .9));
      box-shadow: 0 12px 30px rgba(60, 74, 214, .24);
    }
    .shared-profile-shell {
      width: min(1180px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 1.5rem 0 4rem;
    }
    .shared-card {
      border: 1px solid var(--shared-border);
      border-radius: 24px;
      background: linear-gradient(145deg, rgba(14, 22, 50, .9), rgba(8, 14, 32, .78));
      box-shadow:
        0 24px 70px rgba(0, 0, 0, .28),
        inset 0 1px 0 rgba(255, 255, 255, .045);
    }
    .shared-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.32fr) minmax(320px, .68fr);
      gap: 1rem;
      align-items: stretch;
    }
    .shared-score-card {
      position: relative;
      overflow: hidden;
      min-height: 390px;
      padding: clamp(1.35rem, 3vw, 2rem);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .shared-score-card::before {
      content: "";
      position: absolute;
      width: 320px;
      height: 320px;
      right: -120px;
      top: -135px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(66, 217, 255, .18), rgba(124, 92, 255, .06) 46%, transparent 72%);
      pointer-events: none;
    }
    .shared-score-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(115deg, rgba(124, 92, 255, .08), transparent 48%);
      pointer-events: none;
    }
    .shared-kicker,
    .shared-profile-row,
    .shared-score-block,
    .shared-hero-actions {
      position: relative;
      z-index: 1;
    }
    .shared-kicker {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      color: #9feaff;
      font-size: .76rem;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .shared-kicker > span:first-child {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
    }
    .shared-kicker svg { width: 17px; height: 17px; }
    .shared-public-pill {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      min-height: 30px;
      padding: .35rem .65rem;
      border: 1px solid rgba(52, 211, 153, .24);
      border-radius: 999px;
      color: #7ee9b8;
      background: rgba(16, 185, 129, .08);
      font-size: .7rem;
      letter-spacing: .04em;
    }
    .shared-public-pill::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 14px rgba(52, 211, 153, .8);
    }
    .shared-profile-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1.6rem;
    }
    .shared-profile-avatar {
      width: 72px;
      height: 72px;
      flex: 0 0 72px;
      border-radius: 22px;
      object-fit: cover;
      border: 2px solid rgba(124, 92, 255, .48);
      background: rgba(255, 255, 255, .05);
      box-shadow: 0 12px 34px rgba(40, 32, 128, .32);
    }
    .shared-profile-avatar-fallback {
      display: grid;
      place-items: center;
      font-size: 1.65rem;
      font-weight: 900;
      color: #fff;
      background: linear-gradient(135deg, #7558f8, #287ccf);
    }
    .shared-profile-row h1 {
      margin: 0;
      font-size: clamp(1.35rem, 3vw, 2rem);
      line-height: 1.15;
      letter-spacing: -.025em;
    }
    .shared-profile-row p {
      margin: .38rem 0 0;
      color: var(--shared-muted);
      font-size: .88rem;
    }
    .shared-score-block {
      margin: 2.1rem 0 1.4rem;
    }
    .shared-score-block span {
      display: block;
      margin-bottom: .55rem;
      color: var(--shared-muted);
      font-size: .76rem;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .shared-score-block strong {
      display: block;
      font-size: clamp(4.7rem, 10vw, 7.6rem);
      line-height: .82;
      letter-spacing: -.08em;
      background: linear-gradient(135deg, #fff 22%, #a9dfff 64%, #bfa7ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 16px 44px rgba(79, 123, 255, .16);
    }
    .shared-hero-actions,
    .shared-tier-actions {
      display: flex;
      flex-wrap: wrap;
      gap: .65rem;
    }
    .shared-action {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      padding: .68rem .95rem;
      border: 1px solid rgba(148, 163, 255, .18);
      border-radius: 13px;
      background: rgba(255, 255, 255, .045);
      color: inherit;
      text-decoration: none;
      font: inherit;
      font-size: .83rem;
      font-weight: 850;
      cursor: pointer;
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .shared-action:hover {
      transform: translateY(-1px);
      border-color: rgba(148, 163, 255, .34);
      background: rgba(255, 255, 255, .075);
    }
    .shared-action.is-primary {
      border-color: transparent;
      background: linear-gradient(135deg, #7d5cff, #397ef5);
      box-shadow: 0 12px 26px rgba(76, 75, 220, .28);
    }
    .shared-action svg { width: 16px; height: 16px; }
    .shared-tier-card {
      position: relative;
      overflow: hidden;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        radial-gradient(circle at 85% 8%, rgba(245, 196, 81, .12), transparent 34%),
        linear-gradient(145deg, rgba(22, 27, 55, .96), rgba(10, 15, 34, .88));
    }
    .shared-tier-icon {
      width: 62px;
      height: 62px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(245, 196, 81, .28);
      border-radius: 20px;
      color: var(--shared-gold);
      background: rgba(245, 196, 81, .08);
      box-shadow: 0 16px 40px rgba(174, 118, 20, .12);
    }
    .shared-tier-icon svg { width: 28px; height: 28px; }
    .shared-tier-label {
      display: block;
      margin-top: 1.5rem;
      color: var(--shared-muted);
      font-size: .73rem;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .shared-tier-card h2 {
      margin: .35rem 0 0;
      font-size: clamp(1.8rem, 4vw, 2.7rem);
      line-height: 1;
      letter-spacing: -.04em;
    }
    .shared-tier-range {
      margin: .65rem 0 0;
      color: var(--shared-muted);
      font-size: .82rem;
    }
    .shared-progress-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: .75rem;
      margin-top: 2rem;
      color: var(--shared-muted);
      font-size: .78rem;
    }
    .shared-progress-head strong { color: var(--shared-text); }
    .shared-progress-track {
      height: 12px;
      margin: .75rem 0 .65rem;
      padding: 2px;
      border: 1px solid rgba(148, 163, 255, .13);
      border-radius: 999px;
      background: rgba(255, 255, 255, .035);
      overflow: hidden;
    }
    .shared-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #7d5cff, #42d9ff);
      box-shadow: 0 0 16px rgba(66, 217, 255, .28);
    }
    .shared-progress-note {
      margin: 0;
      color: var(--shared-muted);
      font-size: .8rem;
    }
    .shared-overview-grid {
      display: grid;
      grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .shared-section {
      padding: 1.3rem;
    }
    .shared-section-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .shared-section-title {
      display: flex;
      align-items: center;
      gap: .65rem;
      font-size: .9rem;
      font-weight: 900;
      letter-spacing: .02em;
    }
    .shared-section-title > span {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(124, 92, 255, .2);
      border-radius: 11px;
      color: #b9a9ff;
      background: rgba(124, 92, 255, .08);
    }
    .shared-section-title svg { width: 16px; height: 16px; }
    .shared-section-heading p {
      margin: .3rem 0 0;
      color: var(--shared-muted);
      font-size: .78rem;
    }
    .shared-stat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .7rem;
    }
    .shared-stat {
      min-height: 112px;
      padding: 1rem;
      border: 1px solid rgba(148, 163, 255, .11);
      border-radius: 17px;
      background: rgba(255, 255, 255, .032);
    }
    .shared-stat strong {
      display: block;
      font-size: 1.9rem;
      line-height: 1;
      letter-spacing: -.04em;
    }
    .shared-stat span {
      display: block;
      margin-top: .55rem;
      color: var(--shared-muted);
      font-size: .76rem;
      line-height: 1.35;
    }
    .shared-breakdown-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: .65rem;
    }
    .shared-breakdown-item {
      min-height: 104px;
      padding: .95rem .8rem;
      border: 1px solid rgba(148, 163, 255, .1);
      border-radius: 16px;
      background: linear-gradient(145deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .015));
      text-align: center;
    }
    .shared-breakdown-item strong {
      display: block;
      font-size: 1.65rem;
      line-height: 1;
    }
    .shared-breakdown-item span {
      display: block;
      margin-top: .55rem;
      color: var(--shared-muted);
      font-size: .71rem;
      line-height: 1.3;
    }
    .shared-badges-section {
      margin-top: 1rem;
      padding: 1.35rem;
    }
    .shared-badge-total {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      padding: .35rem .7rem;
      border: 1px solid rgba(66, 217, 255, .16);
      border-radius: 999px;
      color: #9feaff;
      background: rgba(66, 217, 255, .055);
      font-size: .72rem;
      font-weight: 850;
    }
    .shared-badge-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: .8rem;
    }
    .shared-badge-card {
      min-width: 0;
      min-height: 220px;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border: 1px solid rgba(148, 163, 255, .11);
      border-radius: 19px;
      background: linear-gradient(155deg, rgba(255, 255, 255, .045), rgba(255, 255, 255, .018));
      color: inherit;
      text-decoration: none;
      transition: transform .2s ease, border-color .2s ease, background .2s ease;
    }
    a.shared-badge-card:hover {
      transform: translateY(-3px);
      border-color: rgba(124, 92, 255, .32);
      background: linear-gradient(155deg, rgba(124, 92, 255, .09), rgba(255, 255, 255, .02));
    }
    .shared-badge-art {
      height: 104px;
      display: grid;
      place-items: center;
      margin-bottom: .85rem;
      border-radius: 15px;
      background:
        radial-gradient(circle at 50% 20%, rgba(124, 92, 255, .14), transparent 60%),
        rgba(255, 255, 255, .025);
    }
    .shared-badge-art img {
      width: 88px;
      height: 88px;
      object-fit: contain;
    }
    .shared-badge-art svg {
      width: 34px;
      height: 34px;
      color: #b7a6ff;
    }
    .shared-badge-card h3 {
      margin: 0;
      min-height: 2.6em;
      font-size: .86rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .shared-badge-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .6rem;
      margin-top: auto;
      padding-top: .9rem;
      color: var(--shared-muted);
      font-size: .7rem;
    }
    .shared-badge-meta strong { color: #9feaff; }
    .shared-empty {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--shared-muted);
      text-align: center;
    }
    .shared-cta {
      margin-top: 1rem;
      padding: 1.2rem 1.3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      overflow: hidden;
      position: relative;
    }
    .shared-cta::after {
      content: "";
      position: absolute;
      width: 180px;
      height: 180px;
      right: -70px;
      top: -80px;
      border-radius: 50%;
      background: rgba(124, 92, 255, .1);
      pointer-events: none;
    }
    .shared-cta-copy {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: .85rem;
      position: relative;
      z-index: 1;
    }
    .shared-cta-icon {
      width: 46px;
      height: 46px;
      flex: 0 0 46px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(245, 196, 81, .24);
      border-radius: 15px;
      color: var(--shared-gold);
      background: rgba(245, 196, 81, .07);
    }
    .shared-cta-copy strong,
    .shared-cta-copy span { display: block; }
    .shared-cta-copy strong { font-size: .94rem; }
    .shared-cta-copy span {
      margin-top: .28rem;
      color: var(--shared-muted);
      font-size: .79rem;
    }
    .shared-status-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1rem;
    }
    .shared-status-card {
      width: min(480px, 100%);
      padding: 2rem;
      text-align: center;
    }
    .shared-status-icon {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      margin: 0 auto 1rem;
      border: 1px solid rgba(124, 92, 255, .28);
      border-radius: 19px;
      color: #b9a9ff;
      background: rgba(124, 92, 255, .08);
    }
    .shared-status-icon svg { width: 25px; height: 25px; }
    .shared-status-page.is-loading .shared-status-icon svg { animation: spin 1s linear infinite; }
    .shared-status-card h1 { margin: 0; font-size: 1.35rem; }
    .shared-status-card p {
      margin: .65rem auto 0;
      max-width: 34ch;
      color: var(--shared-muted);
      font-size: .86rem;
      line-height: 1.6;
    }
    .shared-status-card .shared-action { margin-top: 1rem; }
    html[data-theme="light"] .public-profile-page {
      --shared-surface: rgba(255, 255, 255, .86);
      --shared-surface-strong: #fff;
      --shared-surface-soft: rgba(15, 23, 42, .035);
      --shared-border: rgba(70, 78, 130, .14);
      --shared-border-strong: rgba(99, 74, 214, .24);
      --shared-text: #11162d;
      --shared-muted: rgba(52, 62, 94, .7);
      background:
        radial-gradient(circle at 8% 6%, rgba(124, 92, 255, .13), transparent 30%),
        radial-gradient(circle at 92% 12%, rgba(66, 217, 255, .12), transparent 28%),
        linear-gradient(180deg, #f6f8ff 0%, #eef2ff 55%, #f8faff 100%);
    }
    html[data-theme="light"] .public-profile-page .arcade-header {
      background: rgba(247, 249, 255, .78);
    }
    html[data-theme="light"] .shared-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, .94), rgba(246, 248, 255, .86));
      box-shadow: 0 24px 60px rgba(52, 62, 110, .1), inset 0 1px 0 #fff;
    }
    html[data-theme="light"] .shared-tier-card {
      background:
        radial-gradient(circle at 85% 8%, rgba(245, 196, 81, .16), transparent 34%),
        linear-gradient(145deg, #fff, #f6f8ff);
    }
    html[data-theme="light"] .shared-score-block strong {
      background: linear-gradient(135deg, #151b36 20%, #4167c8 68%, #7653d9 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
    html[data-theme="light"] .shared-stat,
    html[data-theme="light"] .shared-breakdown-item,
    html[data-theme="light"] .shared-badge-card {
      background: rgba(63, 72, 128, .03);
    }
    @media (max-width: 980px) {
      .shared-hero,
      .shared-overview-grid { grid-template-columns: 1fr; }
      .shared-tier-card { min-height: 300px; }
      .shared-badge-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 760px) {
      .public-profile-page .arcade-nav { display: none; }
      .shared-breakdown-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .shared-badge-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .public-profile-page .arcade-header,
      .shared-profile-shell { width: min(100% - 1rem, 1180px); }
      .public-profile-page .arcade-header { padding-block: .7rem; }
      .public-profile-page .arcade-header-actions .header-store-link span { display: none; }
      .public-profile-page .arcade-header-actions .header-store-link {
        width: 42px;
        min-width: 42px;
        padding-inline: 0;
      }
      .shared-profile-shell { padding-top: .75rem; }
      .shared-card { border-radius: 20px; }
      .shared-score-card { min-height: 360px; padding: 1.1rem; }
      .shared-kicker { align-items: flex-start; flex-direction: column; }
      .shared-profile-row { margin-top: 1.15rem; }
      .shared-profile-avatar {
        width: 60px;
        height: 60px;
        flex-basis: 60px;
        border-radius: 18px;
      }
      .shared-score-block { margin: 1.65rem 0 1.2rem; }
      .shared-score-block strong { font-size: clamp(4.2rem, 25vw, 6.4rem); }
      .shared-hero-actions .shared-action { flex: 1 1 calc(50% - .35rem); }
      .shared-tier-card,
      .shared-section,
      .shared-badges-section { padding: 1.05rem; }
      .shared-stat-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .shared-stat { min-height: 100px; padding: .85rem .7rem; }
      .shared-stat strong { font-size: 1.55rem; }
      .shared-breakdown-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .shared-breakdown-item { min-height: 92px; }
      .shared-badge-grid { gap: .6rem; }
      .shared-badge-card { min-height: 206px; padding: .8rem; border-radius: 16px; }
      .shared-badge-art { height: 92px; }
      .shared-badge-art img { width: 76px; height: 76px; }
      .shared-cta { align-items: stretch; flex-direction: column; padding: 1rem; }
      .shared-cta .shared-action { width: 100%; position: relative; z-index: 1; }
    }
    @media (max-width: 420px) {
      .shared-stat-grid { grid-template-columns: 1fr; }
      .shared-stat {
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .shared-stat span { margin-top: 0; text-align: right; }
      .shared-badge-grid { grid-template-columns: 1fr; }
      .shared-badge-card { min-height: 190px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .shared-action,
      .shared-badge-card { transition: none; }
      .shared-status-page.is-loading .shared-status-icon svg { animation: none; }
    }
  `}</style>
}

function SharedProfileContent() {
  const searchParams = useSearchParams()
  const profileId = (searchParams.get("id") ?? "").trim()
  const [state, setState] = useState<State>({ status: "loading" })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!PROFILE_ID_PATTERN.test(profileId)) {
      setState({ status: "error", message: "This profile link is invalid." })
      return
    }

    setState({ status: "loading" })
    const controller = new AbortController()
    const profileUrl = `https://www.skills.google/public_profiles/${profileId}`
    let timedOut = false
    const timeout = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    void (async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: profileUrl, season: "2026" }),
          signal: controller.signal,
        })
        let payload: ArcadeApiResponse | null = null
        try {
          payload = await response.json() as ArcadeApiResponse
        } catch {
          // Keep the stable error below when the response is not JSON.
        }
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "The profile could not be loaded.")
        }
        setState({ status: "ready", data: payload, profileUrl })
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (timedOut) {
            setState({ status: "error", message: "The request timed out. Please try again." })
          }
          return
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "The profile could not be loaded.",
        })
      } finally {
        window.clearTimeout(timeout)
      }
    })()

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [profileId])

  if (state.status === "loading") {
    return (
      <main className="public-profile-page shared-status-page is-loading">
        <SharedProfileStyles />
        <div className="arcade-stars" aria-hidden="true" />
        <article className="shared-card shared-status-card">
          <span className="shared-status-icon"><LoaderCircle /></span>
          <h1>Loading Arcade score…</h1>
          <p>Fetching points, badges and tier information.</p>
        </article>
      </main>
    )
  }

  if (state.status === "error") {
    return (
      <main className="public-profile-page shared-status-page">
        <SharedProfileStyles />
        <div className="arcade-stars" aria-hidden="true" />
        <article className="shared-card shared-status-card">
          <span className="shared-status-icon"><Trophy /></span>
          <h1>Score unavailable</h1>
          <p>{state.message}</p>
          <a className="shared-action is-primary" href={getDashboardHref()}>
            Check another profile
          </a>
        </article>
      </main>
    )
  }

  const profile = state.data.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = safeHttpsUrl(profile?.profileImage)
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const groups = [
    { label: "Skill badges", value: state.data.skill?.length ?? 0 },
    { label: "Arcade games", value: state.data.game?.length ?? 0 },
    { label: "Trivia", value: state.data.trivia?.length ?? 0 },
    { label: "Completion", value: state.data.completion?.length ?? 0 },
    { label: "Special", value: state.data.special?.length ?? 0 },
  ]
  const badges = state.data.badges ?? [
    ...(state.data.game ?? []),
    ...(state.data.trivia ?? []),
    ...(state.data.skill ?? []),
    ...(state.data.completion ?? []),
    ...(state.data.special ?? []),
  ]
  const tier = getTierProgress(points)
  const recentBadges = badges.slice(0, 8)

  async function shareProfile() {
    const url = window.location.href
    const title = `${profileName} · ${formatNumber(points)} Arcade points`
    const text = `${profileName} has ${formatNumber(points)} Arcade points, ${badges.length} badges and is currently ${tier.current?.league ?? "not yet ranked"}.`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
    }
  }

  return (
    <main className="arcade-dashboard-page public-profile-page">
      <SharedProfileStyles />
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <a className="arcade-brand" href={getDashboardHref()} aria-label="Arcade Points home">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>
        <nav className="arcade-nav" aria-label="Profile sections">
          <a className="active" href="#score">Score</a>
          <a href="#badges">Badges</a>
        </nav>
        <div className="arcade-header-actions">
          <button className="header-store-link is-chrome" type="button" onClick={shareProfile}>
            <Share />
            <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </header>

      <section className="shared-profile-shell" aria-label="Shared Arcade score">
        <div className="shared-hero" id="score">
          <article className="shared-card shared-score-card">
            <div className="shared-kicker">
              <span><Sparkles /> Google Cloud Arcade 2026</span>
              <span className="shared-public-pill">Public score</span>
            </div>

            <div className="shared-profile-row">
              {profileImage ? (
                <img
                  className="shared-profile-avatar"
                  src={profileImage}
                  alt={`${profileName} profile`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="shared-profile-avatar shared-profile-avatar-fallback">
                  {profileName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <h1>{profileName}</h1>
                <p>
                  {profile?.memberSince
                    ? `Member since ${profile.memberSince}`
                    : "Google Skills public profile"}
                </p>
              </div>
            </div>

            <div className="shared-score-block">
              <span>Total Arcade points</span>
              <strong>{formatNumber(points)}</strong>
            </div>

            <div className="shared-hero-actions">
              <button className="shared-action is-primary" type="button" onClick={shareProfile}>
                <Share /> {copied ? "Link copied" : "Share score"}
              </button>
              <a
                className="shared-action"
                href={state.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Google Skills <ExternalLink />
              </a>
            </div>
          </article>

          <aside className="shared-card shared-tier-card">
            <div>
              <span className="shared-tier-icon"><Trophy /></span>
              <span className="shared-tier-label">Current tier</span>
              <h2>{tier.current?.league ?? "No tier yet"}</h2>
              <p className="shared-tier-range">
                {tier.current ? tierRangeLabel(tier.current) : "Keep earning points to unlock your first tier."}
              </p>

              <div className="shared-progress-head">
                <span>{tier.next ? `Next: ${tier.next.league}` : "Highest tier reached"}</span>
                <strong>
                  {tier.next
                    ? `${formatNumber(points)} / ${tier.next.points}`
                    : `${formatNumber(points)} pts`}
                </strong>
              </div>
              <div
                className="shared-progress-track"
                role="progressbar"
                aria-label="Tier progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(tier.progress)}
              >
                <div className="shared-progress-fill" style={{ width: `${tier.progress}%` }} />
              </div>
              <p className="shared-progress-note">
                {tier.next
                  ? `${formatNumber(tier.remaining)} points remaining`
                  : tier.current
                    ? "You reached the highest listed tier."
                    : `${OFFICIAL_MILESTONES[0].points} points to the first tier`}
              </p>
            </div>
          </aside>
        </div>

        <div className="shared-overview-grid">
          <article className="shared-card shared-section">
            <div className="shared-section-heading">
              <div>
                <div className="shared-section-title">
                  <span><BadgeCheck /></span> Score summary
                </div>
                <p>A quick overview of this public profile.</p>
              </div>
            </div>
            <div className="shared-stat-grid">
              <div className="shared-stat">
                <strong>{badges.length}</strong>
                <span>Total badges</span>
              </div>
              <div className="shared-stat">
                <strong>{state.data.skill?.length ?? 0}</strong>
                <span>Skill badges</span>
              </div>
              <div className="shared-stat">
                <strong>{state.data.game?.length ?? 0}</strong>
                <span>Arcade games</span>
              </div>
            </div>
          </article>

          <article className="shared-card shared-section">
            <div className="shared-section-heading">
              <div>
                <div className="shared-section-title">
                  <span><Star /></span> Badge breakdown
                </div>
                <p>Achievements grouped by Arcade category.</p>
              </div>
            </div>
            <div className="shared-breakdown-grid">
              {groups.map((group) => (
                <div className="shared-breakdown-item" key={group.label}>
                  <strong>{group.value}</strong>
                  <span>{group.label}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article id="badges" className="shared-card shared-badges-section">
          <div className="shared-section-heading">
            <div>
              <div className="shared-section-title">
                <span><BadgeCheck /></span> Recent achievements
              </div>
              <p>Latest badges visible on this public profile.</p>
            </div>
            <span className="shared-badge-total">{badges.length} badges earned</span>
          </div>

          {recentBadges.length ? (
            <div className="shared-badge-grid">
              {recentBadges.map((badge: ArcadeBadge, index) => {
                const image = safeHttpsUrl(badge.imageURL)
                const href = safeHttpsUrl(badge.badgeURL)
                const card = (
                  <>
                    <div className="shared-badge-art">
                      {image ? (
                        <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                      ) : (
                        <BadgeCheck />
                      )}
                    </div>
                    <h3>{badge.title}</h3>
                    <div className="shared-badge-meta">
                      <strong>
                        {badge.points === "-*"
                          ? "Special scoring rule"
                          : `+${formatNumber(numeric(badge.points))} pts`}
                      </strong>
                      <time>{badge.dateEarned || "Earned badge"}</time>
                    </div>
                  </>
                )

                return href ? (
                  <a
                    className="shared-badge-card"
                    key={`${badge.title}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {card}
                  </a>
                ) : (
                  <article className="shared-badge-card" key={`${badge.title}-${index}`}>
                    {card}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="shared-empty">No Arcade badges found for this profile.</div>
          )}
        </article>

        <article className="shared-card shared-cta">
          <div className="shared-cta-copy">
            <span className="shared-cta-icon"><Trophy /></span>
            <div>
              <strong>Check your own Arcade score</strong>
              <span>Analyze your public Google Skills profile using the same dashboard.</span>
            </div>
          </div>
          <a className="shared-action is-primary" href={getDashboardHref()}>
            Analyze profile <ExternalLink />
          </a>
        </article>
      </section>
    </main>
  )
}

export default function SharedProfileClient() {
  return (
    <Suspense
      fallback={(
        <main className="public-profile-page shared-status-page is-loading">
          <SharedProfileStyles />
          <div className="arcade-stars" aria-hidden="true" />
          <article className="shared-card shared-status-card">
            <span className="shared-status-icon"><LoaderCircle /></span>
            <h1>Loading Arcade score…</h1>
          </article>
        </main>
      )}
    >
      <SharedProfileContent />
    </Suspense>
  )
}
