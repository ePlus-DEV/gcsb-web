"use client"

import {
  ExternalLink,
  CircleHelp,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

type ChatSource = {
  label: string
  href: string
}

type FaqItem = {
  id: string
  keywords: string[]
  answer: {
    en: string
    vi: string
  }
  sources: ChatSource[]
}

type ChatMessage = {
  id: number
  role: "assistant" | "user"
  text: string
  sources?: ChatSource[]
}

const TIER_SOURCE =
  "https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066"
const PRIZE_SOURCE =
  "https://discuss.google.dev/t/clarification-your-2026-arcade-points-the-prize-counter/349716"
const ARCADE_OVERVIEW_SOURCE =
  "https://cloud.google.com/blog/topics/training-certifications/the-arcade-with-google-cloud-game-helps-boost-cloud-skills"
const SPECIAL_GAME_SOURCE =
  "https://discuss.google.dev/t/chasing-the-win-with-pup-kit/331876"

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "tiers",
    keywords: [
      "tier",
      "trooper",
      "ranger",
      "champion",
      "legend",
      "moc diem",
      "hang",
      "cap bac",
      "bao nhieu diem de",
    ],
    answer: {
      en: "For the 2026 season, the official prize tiers are: Trooper 50–74 points, Ranger 75–94, Champion 95–119, and Legend 120+. Prize capacity is limited to 6,000 / 4,000 / 3,000 / 2,500 slots respectively, and Google uses a first-come-first-served waterfall system when a higher tier fills.",
      vi: "Mùa 2026 có 4 tier thưởng chính thức: Trooper 50–74 điểm, Ranger 75–94, Champion 95–119 và Legend từ 120 điểm. Số suất lần lượt là 6.000 / 4.000 / 3.000 / 2.500; Google áp dụng cơ chế first-come-first-served và waterfall khi tier cao đã đầy.",
    },
    sources: [{ label: "Official 2026 tier announcement", href: TIER_SOURCE }],
  },
  {
    id: "prize-counter",
    keywords: [
      "prize counter",
      "redeem",
      "reward",
      "swag",
      "qua",
      "doi qua",
      "nhan qua",
      "trao thuong",
      "khi nao co qua",
      "khi nao doi",
      "prize",
    ],
    answer: {
      en: "For 2026, Google moved to one unified Prize Counter window after the season wraps up at the end of the year. Google has confirmed the window is coming, but an exact opening date should only be trusted once it is officially announced. Your 2026 points remain counted toward that redemption window.",
      vi: "Năm 2026 Google chuyển sang một đợt Prize Counter duy nhất sau khi mùa Arcade kết thúc vào cuối năm. Google đã xác nhận Prize Counter chắc chắn sẽ mở, nhưng ngày mở chính xác chỉ nên tin khi có thông báo chính thức. Điểm bạn kiếm trong năm 2026 vẫn được tính cho đợt đổi quà này.",
    },
    sources: [
      { label: "2026 Prize Counter clarification", href: PRIZE_SOURCE },
      { label: "2026 tiers & season timing", href: TIER_SOURCE },
    ],
  },
  {
    id: "lab-release",
    keywords: [
      "lab",
      "game moi",
      "new game",
      "release",
      "released",
      "ra lab",
      "mo lab",
      "lich lab",
      "khi nao co lab",
      "deadline",
      "monthly lab",
    ],
    answer: {
      en: "Arcade activities are time-limited, but Google does not guarantee one fixed global release hour for every monthly or special game. Monthly games and special events can use different start/end dates. For the most practical view, check this site's Monthly Labs page for known access codes/deadlines, then verify the final timing on the official Arcade page before starting.",
      vi: "Các hoạt động Arcade có thời hạn nhưng Google không cam kết một giờ mở cố định cho mọi monthly game hoặc special game. Mỗi game có thể có ngày bắt đầu/kết thúc khác nhau. Bạn nên xem trang Monthly Labs trên site này để biết access code/deadline đã thu thập được, sau đó kiểm tra lại trang Arcade chính thức trước khi làm.",
    },
    sources: [
      { label: "Google Cloud Arcade overview", href: ARCADE_OVERVIEW_SOURCE },
    ],
  },
  {
    id: "points",
    keywords: [
      "point",
      "points",
      "score",
      "diem",
      "tinh diem",
      "cach tinh",
      "skill badge",
      "game badge",
      "trivia",
      "bao nhieu diem",
    ],
    answer: {
      en: "Arcade points come from eligible completed badges/activities, not from each individual lab task. This calculator follows the current scoring model used by the project: normal Game/Trivia badges are typically 1 point, and 2 Skill Badges equal 1 Arcade point. Special games can override the normal value — some 2026 special games awarded 3 points — so the official game page and Arcade Insider total are the final authority.",
      vi: "Arcade Point được tính từ badge/hoạt động đủ điều kiện đã hoàn thành, không phải mỗi task nhỏ trong lab. Calculator hiện dùng rule: Game/Trivia thông thường thường là 1 điểm và 2 Skill Badge = 1 Arcade Point. Special Game có thể có điểm riêng — đã có special game năm 2026 cho 3 điểm — nên trang game chính thức và tổng điểm trong Arcade Insider vẫn là nguồn quyết định cuối cùng.",
    },
    sources: [
      { label: "Google Cloud Arcade overview", href: ARCADE_OVERVIEW_SOURCE },
      { label: "2026 special-game example", href: SPECIAL_GAME_SOURCE },
    ],
  },
  {
    id: "waterfall",
    keywords: [
      "waterfall",
      "het slot",
      "het suat",
      "full tier",
      "slot",
      "spots left",
      "con suat",
      "first come",
    ],
    answer: {
      en: "In 2026, prize eligibility and point tier are not exactly the same thing because each tier has limited slots. If a higher-tier pool fills, eligible players can roll down to the next tier under Google's waterfall system. Reaching the point threshold therefore does not guarantee an item from that exact tier.",
      vi: "Năm 2026, đạt mốc điểm chưa đồng nghĩa chắc chắn nhận quà đúng tier vì mỗi tier có số suất giới hạn. Nếu tier cao đã đầy, người đủ điều kiện có thể được chuyển xuống tier kế tiếp theo cơ chế waterfall. Vì vậy đạt đủ điểm không đảm bảo 100% còn suất quà ở tier đó.",
    },
    sources: [{ label: "Official waterfall rules", href: TIER_SOURCE }],
  },
  {
    id: "shipping",
    keywords: [
      "ship",
      "shipping",
      "delivery",
      "giao hang",
      "giao qua",
      "bao lau nhan",
      "nhan hang",
      "van chuyen",
    ],
    answer: {
      en: "Google has said the 2026 fulfillment process is being changed to shorten the wait after redemption, but there is no universal delivery-time guarantee for every country. After you redeem, follow the confirmation email and carrier tracking; treat any community ETA as an estimate unless Google gives a specific date.",
      vi: "Google cho biết quy trình fulfillment 2026 đang được thay đổi để rút ngắn thời gian chờ sau khi đổi quà, nhưng không có một SLA giao hàng cố định cho mọi quốc gia. Sau khi redeem, hãy theo dõi email xác nhận và tracking của đơn vị vận chuyển; các mốc thời gian từ cộng đồng chỉ nên xem là ước tính.",
    },
    sources: [{ label: "2026 fulfillment update", href: PRIZE_SOURCE }],
  },
  {
    id: "subscribe",
    keywords: [
      "subscribe",
      "subscription",
      "register",
      "dang ky",
      "tham gia",
      "bat dau",
      "start arcade",
      "arcade la gi",
      "what is arcade",
    ],
    answer: {
      en: "Google Skills Arcade is a hands-on learning program built around limited-time games and challenges on Google Skills. You complete cloud labs, earn badges, build Arcade points, and may qualify for rewards. Use the official Arcade page for enrollment and current event access; this site is an unofficial tracker/calculator.",
      vi: "Google Skills Arcade là chương trình học thực hành trên Google Skills với các game/challenge có thời hạn. Bạn làm lab Cloud, nhận badge, tích Arcade Point và có thể đủ điều kiện nhận reward. Việc đăng ký và truy cập sự kiện nên thực hiện trên trang Arcade chính thức; site này là công cụ theo dõi/calculator không chính thức.",
    },
    sources: [{ label: "Google Cloud Arcade overview", href: ARCADE_OVERVIEW_SOURCE }],
  },
  {
    id: "missing-points",
    keywords: [
      "missing point",
      "missing points",
      "wrong point",
      "sai diem",
      "thieu diem",
      "chua cong diem",
      "khong thay diem",
      "insider",
    ],
    answer: {
      en: "If your estimate and Google's total differ, treat Google's Arcade Insider / official Arcade total as authoritative. First verify that the expected badge is actually earned on your public Google Skills profile and that the activity belongs to the current scoring window. This site's result is an estimate built from public badge data.",
      vi: "Nếu điểm ước tính khác số Google gửi, hãy ưu tiên tổng điểm trong Arcade Insider / nguồn chính thức của Google. Trước tiên kiểm tra badge đã thực sự xuất hiện trên public Google Skills profile và hoạt động đó nằm trong thời gian được tính điểm. Kết quả trên site này chỉ là ước tính từ dữ liệu badge công khai.",
    },
    sources: [{ label: "Official 2026 tracking guidance", href: TIER_SOURCE }],
  },
]

const QUICK_PROMPTS = {
  en: [
    "How are Arcade points calculated?",
    "What are the 2026 prize tiers?",
    "When does the Prize Counter open?",
    "When are new labs released?",
  ],
  vi: [
    "Arcade tính điểm như thế nào?",
    "Tier thưởng 2026 gồm những mốc nào?",
    "Khi nào Prize Counter mở?",
    "Khi nào có lab mới?",
  ],
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function detectVietnamese(value: string, locale: string): boolean {
  if (locale.startsWith("vi")) return true
  if (/[ăâđêôơưà-ỹ]/i.test(value)) return true
  const normalized = normalize(value)
  return /\b(khi nao|diem|qua|lab moi|tinh diem|dang ky|nhan hang|bao lau|cach)\b/.test(
    normalized,
  )
}

function findAnswer(question: string): FaqItem | null {
  const normalized = normalize(question)
  if (!normalized) return null

  let best: { item: FaqItem; score: number } | null = null
  for (const item of FAQ_ITEMS) {
    const score = item.keywords.reduce(
      (total, keyword) => total + (normalized.includes(normalize(keyword)) ? 1 : 0),
      0,
    )
    if (score > 0 && (!best || score > best.score)) {
      best = { item, score }
    }
  }
  return best?.item ?? null
}

function getLocale(): string {
  if (typeof document === "undefined") return "en"
  return (
    document.documentElement.dataset.locale ||
    document.documentElement.lang ||
    "en"
  ).toLowerCase()
}

export default function ArcadeFaqChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [locale, setLocale] = useState("en")
  const [hiddenForWidget, setHiddenForWidget] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messageId = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const vietnameseUi = locale.startsWith("vi")
  const prompts = vietnameseUi ? QUICK_PROMPTS.vi : QUICK_PROMPTS.en

  const welcome = useMemo(
    () =>
      vietnameseUi
        ? "Chào bạn! Mình có thể trả lời nhanh về Google Skills Arcade 2026: cách tính điểm, tier, lab/game, Prize Counter và reward."
        : "Hi! I can answer quick questions about Google Skills Arcade 2026: points, tiers, labs/games, the Prize Counter and rewards.",
    [vietnameseUi],
  )

  useEffect(() => {
    setLocale(getLocale())
    setHiddenForWidget(
      /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?widget\/?$/i.test(
        window.location.pathname,
      ),
    )

    const observer = new MutationObserver(() => setLocale(getLocale()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "data-locale"],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onEscape)
    window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => document.removeEventListener("keydown", onEscape)
  }, [open])

  useEffect(() => {
    if (!open) return
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, open])

  function ask(rawQuestion: string) {
    const question = rawQuestion.trim()
    if (!question) return

    const useVietnamese = detectVietnamese(question, locale)
    const matched = findAnswer(question)
    const fallback = useVietnamese
      ? "Mình chưa có câu trả lời chắc chắn cho câu này. Bạn có thể hỏi về cách tính điểm, tier 2026, lịch lab/game, Prize Counter, shipping hoặc điểm bị thiếu. Với thông tin có thể thay đổi, hãy ưu tiên thông báo chính thức của Google."
      : "I do not have a reliable answer for that yet. Try asking about point calculation, 2026 tiers, lab/game timing, the Prize Counter, shipping, or missing points. For anything time-sensitive, prefer Google's official announcements."

    const nextUserId = ++messageId.current
    const nextAssistantId = ++messageId.current
    setMessages((current) => [
      ...current,
      { id: nextUserId, role: "user", text: question },
      {
        id: nextAssistantId,
        role: "assistant",
        text: matched
          ? matched.answer[useVietnamese ? "vi" : "en"]
          : fallback,
        sources: matched?.sources,
      },
    ])
    setInput("")
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    ask(input)
  }

  if (hiddenForWidget) return null

  return (
    <div className={open ? "arcade-chatbot is-open" : "arcade-chatbot"}>
      {open ? (
        <section
          className="arcade-chatbot-panel"
          role="dialog"
          aria-label={vietnameseUi ? "Trợ lý Arcade" : "Arcade assistant"}
          aria-modal="false"
        >
          <header className="arcade-chatbot-header">
            <span className="arcade-chatbot-avatar" aria-hidden="true">
              <Sparkles />
            </span>
            <div>
              <strong>Arcade Guide</strong>
              <span>
                {vietnameseUi
                  ? "FAQ nhanh · cập nhật 2026"
                  : "Quick FAQ · 2026 guidance"}
              </span>
            </div>
            <button
              type="button"
              aria-label={vietnameseUi ? "Đóng chat" : "Close chat"}
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </header>

          <div className="arcade-chatbot-log" ref={logRef} aria-live="polite">
            <div className="arcade-chatbot-message is-assistant">
              <span className="arcade-chatbot-mini-avatar" aria-hidden="true">
                <Sparkles />
              </span>
              <div>
                <p>{welcome}</p>
                <small>
                  {vietnameseUi
                    ? "Thông tin có thể thay đổi; Google là nguồn quyết định cuối cùng."
                    : "Details can change; Google remains the final authority."}
                </small>
              </div>
            </div>

            {messages.map((message) => (
              <div
                className={"arcade-chatbot-message is-" + message.role}
                key={message.id}
              >
                {message.role === "assistant" ? (
                  <span className="arcade-chatbot-mini-avatar" aria-hidden="true">
                    <Sparkles />
                  </span>
                ) : null}
                <div>
                  <p>{message.text}</p>
                  {message.sources && message.sources.length > 0 ? (
                    <div className="arcade-chatbot-sources">
                      {message.sources.map((source) => (
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          key={source.href}
                        >
                          {source.label} <ExternalLink />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {messages.length === 0 ? (
              <div className="arcade-chatbot-prompts" aria-label="Suggested questions">
                {prompts.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => ask(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="arcade-chatbot-shortcuts">
            <a href="/monthly-labs/">
              {vietnameseUi ? "Xem Monthly Labs" : "View Monthly Labs"}
            </a>
            <a
              href="https://go.cloudskillsboost.google/arcade"
              target="_blank"
              rel="noreferrer noopener"
            >
              {vietnameseUi ? "Arcade chính thức" : "Official Arcade"}
              <ExternalLink />
            </a>
          </div>

          <form className="arcade-chatbot-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={240}
              placeholder={
                vietnameseUi
                  ? "Hỏi về điểm, lab, reward..."
                  : "Ask about points, labs, rewards..."
              }
              aria-label={vietnameseUi ? "Nhập câu hỏi" : "Ask a question"}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={vietnameseUi ? "Gửi câu hỏi" : "Send question"}
            >
              <Search />
            </button>
          </form>
        </section>
      ) : null}

      <button
        className="arcade-chatbot-launcher"
        type="button"
        aria-expanded={open}
        aria-label={
          vietnameseUi ? "Mở trợ lý Google Arcade" : "Open Google Arcade assistant"
        }
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp />
        <span>{vietnameseUi ? "Hỏi Arcade" : "Ask Arcade"}</span>
      </button>
    </div>
  )
}
