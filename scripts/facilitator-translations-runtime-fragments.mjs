const RUNTIME_FRAGMENTS = {
  en: {
    percentCompletedSuffix: "% completed",
    game: "Game",
  },
  vi: {
    percentCompletedSuffix: "% hoàn thành",
    game: "Trò chơi",
  },
  ja: {
    percentCompletedSuffix: "% 完了",
    game: "ゲーム",
  },
  ko: {
    percentCompletedSuffix: "% 완료",
    game: "게임",
  },
  zh_CN: {
    percentCompletedSuffix: "% 已完成",
    game: "游戏",
  },
  hi: {
    percentCompletedSuffix: "% पूर्ण",
    game: "गेम",
  },
  fr: {
    percentCompletedSuffix: "% terminé",
    game: "Jeu",
  },
  de: {
    percentCompletedSuffix: "% abgeschlossen",
    game: "Spiel",
  },
  es: {
    percentCompletedSuffix: "% completado",
    game: "Juego",
  },
  pt_BR: {
    percentCompletedSuffix: "% concluído",
    game: "Jogo",
  },
  it: {
    percentCompletedSuffix: "% completato",
    game: "Gioco",
  },
  ru: {
    percentCompletedSuffix: "% выполнено",
    game: "Игра",
  },
  ar: {
    percentCompletedSuffix: "% مكتمل",
    game: "لعبة",
  },
}

function findEnglishMessageKey(catalogs, source) {
  return Object.entries(catalogs.en?.messages ?? {}).find(
    ([, value]) => value === source,
  )?.[0]
}

export function applyFacilitatorRuntimeFragments(catalogs) {
  const gameMessageKey = findEnglishMessageKey(catalogs, "Games")

  for (const [locale, catalog] of Object.entries(catalogs)) {
    const translations = RUNTIME_FRAGMENTS[locale]
    if (!translations) {
      throw new Error(`Missing Facilitator runtime fragments for ${locale}.`)
    }

    catalog.additional ??= {}
    catalog.additional["% completed"] = translations.percentCompletedSuffix

    // Existing website catalogs may already map "Games" through messages.
    // Override that exact key because message translations take precedence over
    // additional translations in translateWebsiteText().
    if (gameMessageKey) {
      catalog.messages[gameMessageKey] = translations.game
    } else {
      catalog.additional.Games = translations.game
    }
  }
}
