"use client"

import { useEffect, useState } from "react"
import { Pause, Play, RotateCcw, X } from "lucide-react"
import type { WebsiteLocale } from "@/lib/website-i18n"

/**
 * Simulated recent activity, never a real-time activity feed.
 * The A/B/C/D letters are fictional demo actors and the four event examples
 * reuse the synthetic 112-point Dashboard demonstration data.
 * Labels and disclosure must remain visible. No real account identifiers,
 * user counts, factual timestamps or claims of real visitor activity.
 */
type ActivityText = {
  heading: string
  demo: string
  disclosure: string
  pause: string
  play: string
  hide: string
  restore: string
  examples: [string, string, string, string]
}
const TRANSLATIONS: Record<WebsiteLocale, ActivityText> = {
  vi: {
    heading: "Hoạt động gần đây · mô phỏng",
    demo: "MINH HỌA",
    disclosure: "Tình huống giả lập · không phải lượt kiểm tra thật",
    pause: "Tạm dừng", play: "Tiếp tục", hide: "Ẩn", restore: "Xem lại minh họa",
    examples: [
      "Người dùng mẫu A vừa kiểm tra · 112 điểm Arcade",
      "Người dùng mẫu B vừa xem kết quả · 9 huy hiệu",
      "Người dùng mẫu C vừa xem hạng Champion (không bảo đảm quà)",
      "Người dùng mẫu D vừa xem phân bổ · 50 game + 42 kỹ năng",
    ],
  },
  en: {
    heading: "Recent activity · simulated",
    demo: "DEMO",
    disclosure: "Fictional demo events · not actual user check-ins",
    pause: "Pause", play: "Resume", hide: "Hide", restore: "Show demo",
    examples: [
      "Demo user A just checked · 112 Arcade points",
      "Demo user B just viewed a result · 9 badges",
      "Demo user C just viewed Champion tier (reward not guaranteed)",
      "Demo user D just viewed breakdown · 50 game + 42 skill points",
    ],
  },
  ja: {
    heading:"最近の活動 · デモ",demo:"デモ",disclosure:"架空のプロフィールを使用した例で、実際の利用履歴ではありません",
    pause:"一時停止",play:"再開",hide:"非表示",restore:"デモを表示",
    examples:["サンプルプロフィールを分析 · 112 Arcade ポイント","サンプルプロフィールに9個のバッジ","112ポイント · Championの基準達成（報酬は保証されません）","内訳の例 · ゲーム50点＋スキル42点"],
  },
  ko: {
    heading:"최근 활동 · 데모",demo:"데모",disclosure:"실제 사용자 활동이 아닌 가상 프로필 예시입니다",
    pause:"일시 중지",play:"재개",hide:"숨기기",restore:"데모 보기",
    examples:["예시 프로필 분석 · Arcade 112점","예시 프로필에서 배지 9개 확인","112점 · Champion 점수 기준 달성(보상 보장 아님)","예시 점수 · 게임 50점 + 스킬 42점"],
  },
  zh_CN: {
    heading:"最近活动 · 演示",demo:"演示",disclosure:"来自虚构资料的示例，并非真实用户活动",
    pause:"暂停",play:"继续",hide:"隐藏",restore:"显示演示",
    examples:["示例资料分析完成 · Arcade 112分","示例资料识别出9枚徽章","112分 · 达到Champion积分门槛（不保证获奖）","积分示例 · 游戏50分 + 技能42分"],
  },
  fr: {
    heading:"Activités récentes · simulation",demo:"DÉMO",disclosure:"Exemples issus d’un profil fictif, pas de vraies activités",
    pause:"Pause",play:"Reprendre",hide:"Masquer",restore:"Afficher la démo",
    examples:["Profil exemple analysé · 112 points Arcade","9 badges repérés dans le profil fictif","112 points · Seuil Champion atteint (lot non garanti)","Exemple de répartition · 50 points jeux + 42 points compétences"],
  },
  de: {
    heading:"Letzte Aktivitäten · Simulation",demo:"DEMO",disclosure:"Beispiele mit einem Testprofil, keine echten Nutzeraktivitäten",
    pause:"Pausieren",play:"Fortsetzen",hide:"Ausblenden",restore:"Demo anzeigen",
    examples:["Testprofil analysiert · 112 Arcade-Punkte","9 Badges im Testprofil erkannt","112 Punkte · Champion-Schwelle erreicht (keine Prämiengarantie)","Beispiel-Aufteilung · 50 Spielpunkte + 42 Skillpunkte"],
  },
  es: {
    heading:"Actividad reciente · simulación",demo:"DEMO",disclosure:"Ejemplos de un perfil ficticio, no actividad real de usuarios",
    pause:"Pausar",play:"Reanudar",hide:"Ocultar",restore:"Ver demo",
    examples:["Perfil de ejemplo analizado · 112 puntos Arcade","9 insignias detectadas en el perfil ficticio","112 puntos · Umbral Champion alcanzado (premio no garantizado)","Desglose de ejemplo · 50 puntos de juegos + 42 de habilidades"],
  },
  pt_BR: {
    heading:"Atividade recente · simulação",demo:"DEMO",disclosure:"Exemplos de perfil fictício, não de atividades reais",
    pause:"Pausar",play:"Continuar",hide:"Ocultar",restore:"Mostrar demo",
    examples:["Perfil de exemplo analisado · 112 pontos Arcade","9 badges identificados no perfil de exemplo","112 pontos · Limite Champion atingido (prêmio não garantido)","Exemplo de pontos · 50 de jogos + 42 de habilidades"],
  },
  it: {
    heading:"Attività recenti · simulazione",demo:"DEMO",disclosure:"Esempi da un profilo fittizio, non attività reali",
    pause:"Pausa",play:"Riprendi",hide:"Nascondi",restore:"Mostra demo",
    examples:["Profilo di esempio analizzato · 112 punti Arcade","9 badge trovati nel profilo di esempio","112 punti · Soglia Champion raggiunta (premio non garantito)","Esempio punti · 50 giochi + 42 competenze"],
  },
  ru: {
    heading:"Недавняя активность · демо",demo:"ДЕМО",disclosure:"Примеры из тестового профиля, а не действия реальных людей",
    pause:"Пауза",play:"Продолжить",hide:"Скрыть",restore:"Показать демо",
    examples:["Тестовый профиль проанализирован · 112 очков Arcade","В тестовом профиле найдено 9 значков","112 очков · Порог Champion достигнут (награда не гарантирована)","Пример: 50 очков за игры + 42 за навыки"],
  },
  ar: {
    heading:"نشاط حديث · تجريبي",demo:"تجريبي",disclosure:"أمثلة من ملف افتراضي وليست نشاطًا فعليًا للمستخدمين",
    pause:"إيقاف مؤقت",play:"متابعة",hide:"إخفاء",restore:"عرض المثال",
    examples:["تم تحليل الملف التجريبي · 112 نقطة Arcade","تم التعرف على 9 شارات في الملف التجريبي","112 نقطة · بلوغ حد Champion (المكافأة غير مضمونة)","توزيع تجريبي · 50 نقطة ألعاب + 42 نقطة مهارات"],
  },
  hi: {
    heading:"हाल की गतिविधि · डेमो",demo:"डेमो",disclosure:"काल्पनिक प्रोफ़ाइल के उदाहरण, वास्तविक उपयोगकर्ता गतिविधि नहीं",
    pause:"रोकें",play:"जारी रखें",hide:"छिपाएँ",restore:"डेमो दिखाएँ",
    examples:["डेमो प्रोफ़ाइल का विश्लेषण · 112 Arcade अंक","डेमो प्रोफ़ाइल में 9 बैज मिले","112 अंक · Champion सीमा पूरी (इनाम की गारंटी नहीं)","नमूना अंक · 50 गेम + 42 स्किल अंक"],
  },
}

const HIDDEN_KEY = "eplus-home-activity-demo-hidden-v1"
const INTERVAL_MS = 7500
const DEMO_ACTORS = ["A", "B", "C", "D"] as const

export default function HomeActivityDemo({ locale }: { locale: WebsiteLocale }) {
  const copy = TRANSLATIONS[locale] ?? TRANSLATIONS.en
  const [index, setIndex] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    try { setHidden(localStorage.getItem(HIDDEN_KEY) === "true") } catch { /* optional storage */ }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncMotion = () => setReducedMotion(media.matches)
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible")
    syncMotion()
    syncVisibility()
    media.addEventListener("change", syncMotion)
    document.addEventListener("visibilitychange", syncVisibility)
    return () => {
      media.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncVisibility)
    }
  }, [])

  useEffect(() => {
    if (hidden || paused || reducedMotion || !pageVisible) return
    const timer = window.setInterval(() => {
      setIndex(previous => (previous + 1) % copy.examples.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [copy.examples.length, hidden, paused, reducedMotion, pageVisible])

  const setVisibility = (value: boolean) => {
    setHidden(value)
    try {
      if (value) localStorage.setItem(HIDDEN_KEY, "true")
      else localStorage.removeItem(HIDDEN_KEY)
    } catch { /* optional storage */ }
  }

  if (hidden) {
    return (
      <button
        type="button"
        className="landing-activity-restore"
        onClick={() => setVisibility(false)}
        aria-label={copy.restore}
      ><RotateCcw aria-hidden="true"/>{copy.restore}</button>
    )
  }

  return (
    <div className="landing-activity" aria-label={copy.disclosure} data-activity-mode="demo" data-activity-index={index}>
      <div className="landing-activity-head">
        <span className="landing-activity-heading">
          <span className="landing-activity-status" aria-hidden="true"/>
          {copy.heading}
        </span>
        <span className="landing-activity-demo-badge">{copy.demo}</span>
      </div>
      <div className="landing-activity-content">
        <span className="landing-activity-symbol" aria-hidden="true">{DEMO_ACTORS[index]}</span>
        <span className="landing-activity-detail" aria-live="off" aria-atomic="true">{copy.examples[index]}</span>
      </div>
      <div className="landing-activity-bottom">
        <span className="landing-activity-disclosure">{copy.disclosure}</span>
        <div className="landing-activity-controls">
          <span className="landing-activity-position" aria-hidden="true">
            {copy.examples.map((_,i)=><i key={i} className={i===index?"is-active":undefined}/>)}
          </span>
          <button type="button" aria-label={paused ? copy.play : copy.pause}
            title={paused ? copy.play : copy.pause}
            aria-pressed={paused}
            onClick={() => setPaused(value=>!value)}>
            {paused ? <Play aria-hidden="true"/> : <Pause aria-hidden="true"/>}
          </button>
          <button type="button" aria-label={copy.hide} title={copy.hide} onClick={() => setVisibility(true)}>
            <X aria-hidden="true"/>
          </button>
        </div>
      </div>
    </div>
  )
}
