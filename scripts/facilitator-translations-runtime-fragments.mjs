const RUNTIME_FRAGMENTS = {
  en: {
    percentCompletedSuffix: "% completed",
    games: "Games",
  },
  vi: {
    percentCompletedSuffix: "% hoàn thành",
    games: "Trò chơi",
  },
  ja: {
    percentCompletedSuffix: "% 完了",
    games: "ゲーム",
  },
  ko: {
    percentCompletedSuffix: "% 완료",
    games: "게임",
  },
  zh_CN: {
    percentCompletedSuffix: "% 已完成",
    games: "游戏",
  },
  hi: {
    percentCompletedSuffix: "% पूर्ण",
    games: "गेम",
  },
  fr: {
    percentCompletedSuffix: "% terminé",
    games: "Jeux",
  },
  de: {
    percentCompletedSuffix: "% abgeschlossen",
    games: "Spiele",
  },
  es: {
    percentCompletedSuffix: "% completado",
    games: "Juegos",
  },
  pt_BR: {
    percentCompletedSuffix: "% concluído",
    games: "Jogos",
  },
  it: {
    percentCompletedSuffix: "% completato",
    games: "Giochi",
  },
  ru: {
    percentCompletedSuffix: "% выполнено",
    games: "Игры",
  },
  ar: {
    percentCompletedSuffix: "% مكتمل",
    games: "الألعاب",
  },
}

function findEnglishMessageKey(catalogs, source) {
  return Object.entries(catalogs.en?.messages ?? {}).find(
    ([, value]) => value === source,
  )?.[0]
}

export function applyFacilitatorRuntimeFragments(catalogs) {
  const gamesMessageKey = findEnglishMessageKey(catalogs, "Games")

  for (const [locale, catalog] of Object.entries(catalogs)) {
    const translations = RUNTIME_FRAGMENTS[locale]
    if (!translations) {
      throw new Error(`Missing Facilitator runtime fragments for ${locale}.`)
    }

    catalog.additional ??= {}
    catalog.additional["% completed"] = translations.percentCompletedSuffix

    // Preserve the English source catalog. For target locales, override the
    // existing exact-message key because messages are resolved before
    // additional translations in translateWebsiteText().
    if (locale === "en") continue

    if (gamesMessageKey) {
      catalog.messages[gamesMessageKey] = translations.games
    } else {
      catalog.additional.Games = translations.games
    }
  }
}
