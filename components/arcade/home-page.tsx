"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import {
  ArrowRight, Award, BadgeCheck, CalendarDays, ChartNoAxesCombined, Chrome,
  ChevronDown, Cloud, Gift, Gamepad2, Globe2, Link2, Medal, Puzzle,
  ShieldCheck, Sparkles, Target, Trophy, Users,
} from "lucide-react"
import { ArcadeHeader, ArcadeFooter } from "./route-shell"
import { LANDING_FAQ, LANDING_HEADLINES } from "./home-faq-translations"
import {
  getWebsiteLocale, getWebsiteLocaleFromPathname, getWebsiteLocaleHref,
  loadWebsiteCatalog, type WebsiteCatalog, type WebsiteLocale,
} from "@/lib/website-i18n"

type LandingCopy = {
  eyebrow: string
  heroFirst: string
  heroAccent: string
  heroLast: string
  description: string
  dashboard: string
  extension: string
  trust: [string, string, string]
  sample: string
  demoProfile: string
  demoScore: string
  demoBreakdown: string
  demoProgress: string
  demoHistory: string
  featuresKicker: string
  featuresTitle: string
  featuresDesc: string
  featureTitles: [string, string, string, string, string, string]
  featureDescriptions: [string, string, string, string, string, string]
  stepsKicker: string
  stepsTitle: string
  stepsDesc: string
  stepTitles: [string, string, string]
  stepDescriptions: [string, string, string]
  programsKicker: string
  programsTitle: string
  programsDesc: string
  programTitles: [string, string, string]
  programDescriptions: [string, string, string]
  programLink: string
  programsAll: string
  programTags: [string, string, string]
  faqTitle: string
  faqDescription: string
  questions: [string, string, string, string, string, string]
  answers: [string, string, string, string, string, string]
  ctaTitle: string
  ctaDescription: string
}

const EN: LandingCopy = {
  eyebrow: "A free companion tool for Google Cloud learners",
  heroFirst: "Track and analyze",
  heroAccent: "Google Cloud Arcade",
  heroLast: "all in one place",
  description: "ePlus Arcade makes it easier to review points, understand your progress and estimate eligible reward tiers using your public Google Skills profile.",
  dashboard: "Open Dashboard",
  extension: "Install Extension",
  trust: ["Free to use", "Public profile data", "Multiple languages"],
  sample: "Illustrative preview — not live profile data",
  demoProfile: "Example profile",
  demoScore: "Arcade points",
  demoBreakdown: "Point breakdown",
  demoProgress: "Program progress",
  demoHistory: "Score check history",
  featuresKicker: "ALL IN ONE PLACE",
  featuresTitle: "Core features",
  featuresDesc: "Useful tools to help you understand your Google Cloud Arcade journey.",
  featureTitles: ["Calculate your points", "Analyze reward tiers", "Track earned badges", "Program information", "Browser extension", "Multiple languages"],
  featureDescriptions: [
    "Review eligible badges and your Arcade point breakdown.",
    "Compare score tiers and view availability information without guaranteeing a reward.",
    "See your Arcade, Skill and special-event badges in one place.",
    "Discover Arcade and Facilitator milestones, dates and reward programs.",
    "Open Google Skills tools faster with ePlus Extension.",
    "Use a consistent experience across supported languages.",
  ],
  stepsKicker: "SIMPLE · QUICK · FREE",
  stepsTitle: "How it works",
  stepsDesc: "Start tracking your Arcade progress in just three steps.",
  stepTitles: ["Copy your profile link", "Analyze your data", "Explore the results"],
  stepDescriptions: [
    "Make your Google Skills profile public and copy its URL.",
    "Paste the URL into Dashboard to review available badge data.",
    "Explore your points, tiers, badges and program progress.",
  ],
  programsKicker: "EXPLORE THE PROGRAMS",
  programsTitle: "Google Cloud Arcade 2026",
  programsDesc: "Explore Google Cloud learning activities and the associated program information.",
  programTitles: ["Annual Arcade Program", "Facilitator Program", "Special Rewards"],
  programDescriptions: [
    "Explore monthly games, badge opportunities and learning milestones.",
    "Follow Facilitator milestones, participation and bonus-point rules.",
    "Browse Arcade swag and special reward announcements.",
  ],
  programLink: "View details",
  programsAll: "View all programs",
  programTags: ["Arcade 2026", "Bonus milestones", "Reward updates"],
  faqTitle: "Frequently asked questions",
  faqDescription: "Answers to common questions about ePlus Arcade and Google Cloud Arcade.",
  questions: [
    "Where does ePlus Arcade get its data?",
    "How are Arcade points calculated?",
    "How does reward-tier estimation work?",
    "When are rewards confirmed?",
    "Do I need to install the extension?",
    "How often is the information updated?",
  ],
  answers: [
    "Personal analysis reads your public Google Skills profile. Public program information comes from available Arcade sources. This is an independent, unofficial tool.",
    "Eligible badges are categorized using the currently supported Arcade rules. Some special cases and missing badge data may require manual review.",
    "The Dashboard compares your points with published thresholds and available slot information when available. It cannot know your exact queue position or guarantee a prize.",
    "Only the program organizer can confirm actual reward allocation. A qualifying point total by itself does not guarantee a reward.",
    "No. You can use the Dashboard with a public profile URL. The optional browser extension provides additional conveniences.",
    "Freshness depends on the source. Some public capacity data may be refreshed periodically; the Dashboard identifies when availability information is missing.",
  ],
  ctaTitle: "Ready to start your Google Cloud Arcade journey?",
  ctaDescription: "Open Dashboard to analyze your points, or install the extension for a more convenient workflow.",
}

const VI: LandingCopy = {
  eyebrow: "Công cụ miễn phí cho cộng đồng Google Cloud",
  heroFirst: "Theo dõi, phân tích",
  heroAccent: "Google Cloud Arcade",
  heroLast: "dễ dàng hơn bao giờ hết",
  description: "ePlus Arcade giúp bạn theo dõi điểm, phân tích tiến độ, dự đoán khả năng đạt hạng và không bỏ lỡ cơ hội nhận phần thưởng từ Google Cloud Arcade.",
  dashboard: "Mở Dashboard",
  extension: "Cài đặt Extension",
  trust: ["Miễn phí sử dụng", "Dữ liệu hồ sơ công khai", "Hỗ trợ đa ngôn ngữ"],
  sample: "Giao diện minh họa — không phải dữ liệu người dùng thực",
  demoProfile: "Hồ sơ mẫu",
  demoScore: "Điểm Arcade",
  demoBreakdown: "Thành phần điểm",
  demoProgress: "Tiến độ chương trình",
  demoHistory: "Lịch sử kiểm tra điểm",
  featuresKicker: "TẤT CẢ TRONG MỘT",
  featuresTitle: "Tính năng nổi bật",
  featuresDesc: "Những công cụ hữu ích giúp bạn chinh phục Google Cloud Arcade hiệu quả hơn.",
  featureTitles: ["Tính điểm chính xác", "Phân tích & dự đoán hạng", "Theo dõi huy hiệu", "Thông tin chương trình", "Tiện ích mở rộng", "Giao diện đa ngôn ngữ"],
  featureDescriptions: [
    "Tự động lấy dữ liệu và tính tổng điểm từ các game, huy hiệu và sự kiện đủ điều kiện.",
    "Phân tích tiến độ và dự đoán khả năng đạt hạng dựa trên lịch sử và số suất công khai.",
    "Theo dõi tất cả Arcade badges, Skill badges và special rewards.",
    "Cập nhật thời gian, thể lệ và phần thưởng của Arcade và Facilitator Program.",
    "Lấy nhanh thông tin trên trang Google Skills với ePlus Extension.",
    "Hỗ trợ tiếng Việt và tiếng Anh cùng các ngôn ngữ khác.",
  ],
  stepsKicker: "ĐƠN GIẢN · NHANH CHÓNG · MIỄN PHÍ",
  stepsTitle: "Cách thức hoạt động",
  stepsDesc: "Chỉ với 3 bước đơn giản để bắt đầu theo dõi tiến độ Google Cloud Arcade của bạn.",
  stepTitles: ["Lấy link hồ sơ", "Phân tích dữ liệu", "Xem kết quả"],
  stepDescriptions: [
    "Công khai hồ sơ Google Skills và sao chép liên kết.",
    "ePlus Arcade tự động phân tích huy hiệu và tính điểm từ hồ sơ công khai.",
    "Xem điểm, hạng hiện tại, dự đoán và các thông tin chi tiết.",
  ],
  programsKicker: "CHƯƠNG TRÌNH ĐANG DIỄN RA",
  programsTitle: "Google Cloud Arcade 2026",
  programsDesc: "Tham gia các chương trình Google Cloud Arcade để học hỏi, nhận huy hiệu và có cơ hội nhận những phần thưởng hấp dẫn từ Google.",
  programTitles: ["Annual Arcade Program", "Facilitator Program", "Special Rewards"],
  programDescriptions: [
    "Hàng trăm labs thú vị mỗi tháng với nhiều phần thưởng hấp dẫn.",
    "Tham gia và vai trò Facilitator để nhận thêm điểm với phần thưởng đặc biệt.",
    "Các sự kiện đặc biệt và quà tặng giới hạn dành cho cộng đồng.",
  ],
  programLink: "Xem chi tiết",
  programsAll: "Xem tất cả chương trình",
  programTags: ["Arcade 2026", "Mốc điểm thưởng", "Quà tặng"],
  faqTitle: "Câu hỏi thường gặp",
  faqDescription: "Một số câu hỏi phổ biến về Google Cloud Arcade và ePlus Arcade.",
  questions: [
    "ePlus Arcade lấy dữ liệu từ đâu?",
    "Điểm số được tính như thế nào?",
    "Dự đoán hạng hoạt động ra sao?",
    "Khi nào có kết quả phần thưởng?",
    "Tôi có cần cài Extension không?",
    "Dữ liệu được cập nhật bao lâu một lần?",
  ],
  answers: [
    "Phân tích cá nhân sử dụng hồ sơ Google Skills công khai của bạn. Thông tin chương trình dựa trên các nguồn Arcade sẵn có. Đây là công cụ độc lập, không phải sản phẩm chính thức của Google.",
    "Công cụ phân loại huy hiệu đủ điều kiện theo quy tắc hiện được hỗ trợ. Một số trường hợp đặc biệt hoặc thiếu dữ liệu có thể cần kiểm tra thủ công.",
    "Dashboard so sánh điểm với ngưỡng hạng và số suất công khai (nếu có). Công cụ không biết thứ tự nhận quà chính xác của bạn và không bảo đảm phần thưởng.",
    "Chỉ ban tổ chức mới xác nhận phân bổ quà thực tế. Đạt ngưỡng điểm chưa đồng nghĩa chắc chắn được nhận quà.",
    "Không bắt buộc. Bạn có thể sử dụng Dashboard bằng liên kết hồ sơ công khai. Extension chỉ giúp thao tác thuận tiện hơn.",
    "Tùy nguồn dữ liệu. Một số thông tin về suất thưởng được cập nhật định kỳ; Dashboard sẽ thông báo nếu chưa có dữ liệu.",
  ],
  ctaTitle: "Sẵn sàng bắt đầu hành trình Google Cloud Arcade?",
  ctaDescription: "Mở Dashboard ngay để phân tích tiến độ của bạn hoặc cài đặt Extension để tiện theo dõi.",
}

/**
 * Every locale uses the native site catalog for shared UI. Landing-specific
 * marketing copy is written in English/Vietnamese, with concise localized
 * labels for the other supported languages (never change the score engine).
 */
function landingCopy(locale: WebsiteLocale, m: WebsiteCatalog["messages"]): LandingCopy {
  if (locale === "vi") return VI
  if (locale === "en") return EN
  return {
    ...EN,
    featuresKicker: m.aboutArcade,
    featuresDesc: m.heroDescription,
    stepsKicker: m.stepGuide,
    programsKicker: m.facilitatorProgram,
    heroFirst: m.heroTitleTop,
    heroAccent: m.heroTitleBottom,
    heroLast: m.aboutArcade,
    description: m.heroDescription,
    dashboard: m.dashboardNav,
    extension: m.installExtension,
    trust: [m.noSignIn, m.publicDataOnly, m.privacyByDesign],
    featuresTitle: m.aboutArcade,
    featureTitles: [m.totalArcadePoints, m.scoreTier, m.earnedBadges, m.facilitatorProgram, m.extension, m.privacyByDesign],
    featureDescriptions: [m.heroDescription, m.tierNote, m.allBadgesClassified, m.guestHeroDescription, m.automaticTracking, m.publicDataOnly],
    stepsTitle: m.stepGuide,
    stepsDesc: m.checkPoints,
    stepTitles: [m.openProfile, m.analyzeProfile, m.readScore],
    stepDescriptions: [m.makePublic, m.analyzeProfile, m.dashboardHint],
    programsTitle: m.arcadeTiers,
    programsDesc: m.guestHeroDescription,
    programTitles: [m.arcadeTiers, m.facilitatorProgram, m.tiers],
    programDescriptions: [m.guestHeroDescription, m.facilitatorMilestones, m.tierNote],
    programLink: m.guide,
    programsAll: m.facilitatorProgram,
    programTags: ["Arcade 2026", "Facilitator", "Rewards"],
    faqTitle: m.guide,
    faqDescription: m.checkPoints,
    ctaTitle: m.startUsing,
    ctaDescription: m.heroDescription,
    ...LANDING_FAQ[locale],
    ...LANDING_HEADLINES[locale],
  }
}

function DashboardPreview({ copy: c }: { copy: LandingCopy }) {
  return (
    <div className="landing-demo" aria-label={c.sample}>
      <div className="landing-demo-top">
        <div className="landing-demo-brand"><span>✦</span> ePlus Arcade</div>
        <span className="landing-demo-tab is-current">Dashboard</span>
        <span className="landing-demo-tab">Badges</span>
        <span className="landing-demo-tab">Programs</span>
        <span className="landing-demo-sample">DEMO</span>
      </div>
      <div className="landing-demo-body">
        <div className="landing-demo-profile">
          <div className="landing-demo-identity"><span className="landing-demo-avatar">AP</span><div><strong>{c.demoProfile}</strong><small>Google Skills</small></div></div>
          <small>{c.demoScore}</small>
          <strong className="landing-demo-points">128 <em>PTS</em></strong>
          <div className="landing-demo-gauge"><span>72%</span></div>
          <div className="landing-demo-stat"><strong>6</strong><span>Game</span><strong>12</strong><span>Skill</span></div>
        </div>
        <div className="landing-demo-content">
          <div className="landing-demo-chips"><span><Trophy /> Arcade</span><span><Users /> Facilitator</span><span><Award /> Leaderboard</span></div>
          <div className="landing-demo-card">
            <div className="landing-demo-heading"><strong>{c.demoBreakdown}</strong><span>•••</span></div>
            <div className="landing-demo-bar"><span style={{width:"82%"}} /></div>
            <div className="landing-demo-line"><i/><span>Arcade games</span><b>82</b></div>
            <div className="landing-demo-line"><i/><span>Skill badges</span><b>36</b></div>
            <div className="landing-demo-line"><i/><span>Bonus</span><b>10</b></div>
          </div>
          <div className="landing-demo-card landing-demo-bottom">
            <div className="landing-demo-heading"><strong>{c.demoProgress}</strong><span>2026</span></div>
            <div className="landing-demo-bar is-blue"><span style={{width:"72%"}}/></div>
            <small>72% progress</small>
          </div>
        </div>
        <div className="landing-demo-right">
          <div className="landing-demo-card">
            <div className="landing-demo-heading"><strong>{c.demoHistory}</strong><span>2026</span></div>
            <svg viewBox="0 0 260 135" role="presentation" aria-hidden="true">
              <path d="M0 112H260M0 74H260M0 36H260" fill="none" stroke="#e6eaf7" strokeWidth="1"/>
              <path d="M7 112 L42 95 L78 98 L114 74 L149 66 L185 90 L223 49 L253 16" fill="none" stroke="#5975ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              {[ [7,112], [42,95], [78,98], [114,74], [149,66], [185,90], [223,49], [253,16] ].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" fill="#5975ff" stroke="#fff" strokeWidth="2"/>)}
            </svg>
          </div>
          <div className="landing-demo-notice"><BadgeCheck /><span>{c.demoScore} · 2026</span></div>
        </div>
      </div>
      <span className="landing-demo-disclaimer">{c.sample}</span>
      <span className="landing-demo-floating-controller" aria-hidden="true"><Gamepad2 /></span>
      <span className="landing-demo-sparkle" aria-hidden="true">✦</span>
    </div>
  )
}

const FEATURE_ICONS = [Trophy, ChartNoAxesCombined, Medal, CalendarDays, Puzzle, Globe2] as const
const FEATURE_TONES = ["blue", "orange", "gold", "rose", "violet", "cyan"] as const
const STEP_ICONS = [Link2, ChartNoAxesCombined, Target] as const
const PROGRAM_ICONS = [Cloud, Users, Gift] as const

/** Reference implementation of the approved light/pastel Home mockup.
 * Home introduces the product; live points, badges and allocation live in Dashboard.
 * All displayed dashboard preview values are explicitly labeled illustrations. */
export default function HomePage({catalog, locale}: {catalog: WebsiteCatalog; locale: WebsiteLocale; children?: ReactNode}) {
  const [language, setLanguage] = useState({catalog, locale})
  const [showDeadlines, setShowDeadlines] = useState(false)
  const {setTheme} = useTheme()

  // A new landing has its own visual default. Existing site-wide Dashboard dark
  // preferences must not silently turn the approved light mockup into a dark page.
  // Once a visitor explicitly switches the Home theme, honor that Home choice.
  useEffect(() => {
    let saved: string | null = null
    try { saved = window.localStorage.getItem("arcade-home-theme-v2") } catch { /* optional storage */ }
    setTheme(saved === "dark" ? "dark" : "light")
  }, [setTheme])
  useEffect(() => {
    let active = true
    const sync = async () => {
      const next = getWebsiteLocaleFromPathname(window.location.pathname)
        ?? getWebsiteLocale(document.documentElement.dataset.locale)
      const nextCatalog = await loadWebsiteCatalog(next).catch(() => null)
      if (active && nextCatalog) setLanguage({catalog:nextCatalog, locale:next})
    }
    const observer = new MutationObserver(() => { void sync() })
    observer.observe(document.documentElement, {attributes:true, attributeFilter:["data-locale"]})
    void sync()
    return () => {active=false; observer.disconnect()}
  }, [])

  const c = landingCopy(language.locale, language.catalog.messages)
  const homeHref = getWebsiteLocaleHref(language.locale)
  const dashboardHref = homeHref + "dashboard/"
  const links = [dashboardHref + "#calculator", dashboardHref + "#tiers", dashboardHref + "#badges", "#programs", "#extension", "/about/"]
  const programLinks = [dashboardHref + "#monthly-games", "#program-countdown", "/swag-drops/2026/"]
  const revealProgramDeadlines = () => {
    setShowDeadlines(true)
    requestAnimationFrame(() => document.getElementById("program-countdown")?.scrollIntoView({behavior:"smooth", block:"start"}))
  }

  return (
    <main className="arcade-dashboard-page arcade-dashboard-v2 arcade-ui-refresh arcade-home-route landing-home" data-dashboard-view="guest">
      <ArcadeHeader catalog={language.catalog} locale={language.locale} landing />
      <section id="top" className="arcade-hero home-intro-hero landing-hero" data-home-order="hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><Sparkles aria-hidden="true"/>{c.eyebrow}</span>
          <h1>{c.heroFirst}<br/><span>{c.heroAccent}</span><br/>{c.heroLast}</h1>
          <p>{c.description}</p>
          <div className="landing-actions">
            <Link className="landing-button is-primary" href={dashboardHref}>{c.dashboard}<ArrowRight aria-hidden="true"/></Link>
            <a className="landing-button is-secondary" href="#extension"><Chrome aria-hidden="true"/>{c.extension}</a>
          </div>
          <div className="landing-trust">
            <span><BadgeCheck/>{c.trust[0]}</span>
            <span><ShieldCheck/>{c.trust[1]}</span>
            <span><Globe2/>{c.trust[2]}</span>
          </div>
        </div>
        <DashboardPreview copy={c}/>
      </section>

      <section id="features" className="landing-section landing-features" aria-labelledby="landing-features-title">
        <span className="landing-section-kicker">{c.featuresKicker}</span>
        <h2 id="landing-features-title">{c.featuresTitle}</h2>
        <p className="landing-section-lead">{c.featuresDesc}</p>
        <div className="landing-feature-grid">
          {FEATURE_ICONS.map((Icon, i) => (
            <Link key={i} href={links[i]} className="landing-feature-card">
              <span className={"landing-feature-icon tone-" + FEATURE_TONES[i]}><Icon aria-hidden="true"/></span>
              <strong>{c.featureTitles[i]}</strong><p>{c.featureDescriptions[i]}</p>
              <span className="landing-card-arrow" aria-hidden="true"><ArrowRight/></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-how" aria-labelledby="landing-how-title">
        <span className="landing-section-kicker">{c.stepsKicker}</span>
        <h2 id="landing-how-title">{c.stepsTitle}</h2>
        <p className="landing-section-lead">{c.stepsDesc}</p>
        <div className="landing-step-grid">
          {STEP_ICONS.map((Icon,i) => (
            <div className="landing-step-wrap" key={i}>
              <div className="landing-step-card">
                <span className="landing-step-num">{i+1}</span>
                <Icon className="landing-step-icon" aria-hidden="true"/>
                <strong>{c.stepTitles[i]}</strong>
                <p>{c.stepDescriptions[i]}</p>
              </div>
              {i<2 && <ArrowRight className="landing-step-arrow" aria-hidden="true"/>}
            </div>
          ))}
        </div>
      </section>

      <section id="programs" className="landing-section landing-programs" aria-labelledby="landing-programs-title">
        <span className="landing-section-kicker">{c.programsKicker}</span>
        <div className="landing-programs-heading">
          <h2 id="landing-programs-title">{c.programsTitle}</h2>
          <button className="landing-programs-view-all" type="button" onClick={revealProgramDeadlines} aria-expanded={showDeadlines} aria-controls="program-countdown">{c.programsAll}<ArrowRight aria-hidden="true"/></button>
        </div>
        <p className="landing-section-lead">{c.programsDesc}</p>
        <div className="landing-program-grid">
          {PROGRAM_ICONS.map((Icon,i) => (
            <Link key={i} href={programLinks[i]} className={"landing-program-card landing-program-card-" + i} onClick={i === 1 ? revealProgramDeadlines : undefined}>
              <div className="landing-program-card-top">
                <Icon className={"landing-program-icon icon-" + i} aria-hidden="true"/>
                <small className={"landing-program-tag landing-program-tag-" + i}>{c.programTags[i]}</small>
              </div>
              <strong>{c.programTitles[i]}</strong>
              <p>{c.programDescriptions[i]}</p>
              <span>{c.programLink}<ArrowRight aria-hidden="true"/></span>
            </Link>
          ))}
        </div>
        <div id="program-countdown" className={"program-countdown-host" + (showDeadlines ? " is-visible" : "")} data-home-order="program-countdown" aria-hidden={!showDeadlines}/>
      </section>

      <section id="faq" className="landing-section landing-faq" aria-labelledby="landing-faq-title">
        <span className="landing-section-kicker">FAQ</span>
        <h2 id="landing-faq-title">{c.faqTitle}</h2>
        <p className="landing-section-lead">{c.faqDescription}</p>
        <div className="landing-faq-grid">
          {c.questions.map((q, i) => (
            <details key={i} className="landing-faq-item">
              <summary>{q}<ChevronDown aria-hidden="true"/></summary>
              <p>{c.answers[i]}</p>
            </details>
          ))}
        </div>
        <div className="landing-faq-art" aria-hidden="true"><span className="landing-faq-art-small">•••</span><span className="landing-faq-art-large">?</span></div>
      </section>

      <section id="extension" className="landing-last-cta" aria-labelledby="landing-cta-title">
        <span className="landing-cta-trophy"><Trophy aria-hidden="true"/></span><span className="landing-cta-stars" aria-hidden="true">✦</span>
        <div><h2 id="landing-cta-title">{c.ctaTitle}</h2><p>{c.ctaDescription}</p></div>
        <div className="landing-last-actions">
          <Link className="landing-button is-primary" href={dashboardHref}>{c.dashboard}<ArrowRight aria-hidden="true"/></Link>
          <a className="landing-button is-secondary" href="https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg" target="_blank" rel="noopener noreferrer"><Chrome aria-hidden="true"/>{c.extension}</a>
        </div>
      </section>
      <ArcadeFooter catalog={language.catalog} locale={language.locale} landing />
    </main>
  )
}
