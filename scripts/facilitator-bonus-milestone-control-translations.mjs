const SOURCES = {
  completedTitle: "Bonus Milestone completed",
  bonusApplied: "+10 bonus applied. Open to review the completed steps.",
  completionSaved:
    "Completion is saved. Close the details again or undo if needed.",
  confirmCompleted: "Confirm after you finish all required steps above.",
  openDetails: "Open details",
  closeDetails: "Close details",
  undo: "Undo",
  markCompleted: "Mark completed",
}

const TRANSLATIONS = {
  vi: {
    completedTitle: "Đã hoàn thành Bonus Milestone",
    bonusApplied:
      "+10 điểm thưởng đã được áp dụng. Mở chi tiết để xem lại các bước đã hoàn thành.",
    completionSaved:
      "Trạng thái hoàn thành đã được lưu. Bạn có thể đóng chi tiết hoặc hoàn tác nếu cần.",
    confirmCompleted:
      "Xác nhận sau khi bạn hoàn thành tất cả các bước bắt buộc ở trên.",
    openDetails: "Mở chi tiết",
    closeDetails: "Đóng chi tiết",
    undo: "Hoàn tác",
    markCompleted: "Đánh dấu hoàn thành",
    viewGear: "Xem 4 GEAR skill badge · {count}/4",
    hideGear: "Ẩn GEAR skill badge · {count}/4",
  },
  ja: {
    completedTitle: "Bonus Milestone 完了",
    bonusApplied: "+10 ボーナスを適用しました。開いて完了済みの手順を確認できます。",
    completionSaved:
      "完了状態を保存しました。詳細を閉じるか、必要に応じて元に戻せます。",
    confirmCompleted: "上の必須手順をすべて完了した後に確認してください。",
    openDetails: "詳細を開く",
    closeDetails: "詳細を閉じる",
    undo: "元に戻す",
    markCompleted: "完了としてマーク",
    viewGear: "GEAR スキルバッジ 4 個を表示 · {count}/4",
    hideGear: "GEAR スキルバッジを非表示 · {count}/4",
  },
  ko: {
    completedTitle: "Bonus Milestone 완료",
    bonusApplied: "+10 보너스가 적용되었습니다. 열어서 완료한 단계를 다시 확인할 수 있습니다.",
    completionSaved:
      "완료 상태가 저장되었습니다. 세부 정보를 다시 닫거나 필요하면 실행 취소할 수 있습니다.",
    confirmCompleted: "위의 필수 단계를 모두 완료한 후 확인하세요.",
    openDetails: "세부 정보 열기",
    closeDetails: "세부 정보 닫기",
    undo: "실행 취소",
    markCompleted: "완료로 표시",
    viewGear: "GEAR 스킬 배지 4개 보기 · {count}/4",
    hideGear: "GEAR 스킬 배지 숨기기 · {count}/4",
  },
  zh_CN: {
    completedTitle: "Bonus Milestone 已完成",
    bonusApplied: "+10 奖励已计入。打开详情可查看已完成的步骤。",
    completionSaved: "完成状态已保存。你可以再次关闭详情，或在需要时撤销。",
    confirmCompleted: "完成上方所有必需步骤后再确认。",
    openDetails: "打开详情",
    closeDetails: "关闭详情",
    undo: "撤销",
    markCompleted: "标记为已完成",
    viewGear: "查看 4 个 GEAR 技能徽章 · {count}/4",
    hideGear: "隐藏 GEAR 技能徽章 · {count}/4",
  },
  fr: {
    completedTitle: "Bonus Milestone terminé",
    bonusApplied:
      "+10 de bonus appliqués. Ouvrez les détails pour revoir les étapes terminées.",
    completionSaved:
      "L’état terminé est enregistré. Vous pouvez refermer les détails ou annuler si nécessaire.",
    confirmCompleted:
      "Confirmez après avoir terminé toutes les étapes requises ci-dessus.",
    openDetails: "Ouvrir les détails",
    closeDetails: "Fermer les détails",
    undo: "Annuler",
    markCompleted: "Marquer comme terminé",
    viewGear: "Voir les 4 Skill Badges GEAR · {count}/4",
    hideGear: "Masquer les Skill Badges GEAR · {count}/4",
  },
  de: {
    completedTitle: "Bonus-Meilenstein abgeschlossen",
    bonusApplied:
      "+10 Bonuspunkte angewendet. Öffne die Details, um die abgeschlossenen Schritte zu prüfen.",
    completionSaved:
      "Der Abschlussstatus wurde gespeichert. Du kannst die Details wieder schließen oder bei Bedarf rückgängig machen.",
    confirmCompleted:
      "Bestätige erst, nachdem du alle erforderlichen Schritte oben abgeschlossen hast.",
    openDetails: "Details öffnen",
    closeDetails: "Details schließen",
    undo: "Rückgängig",
    markCompleted: "Als abgeschlossen markieren",
    viewGear: "4 GEAR Skill Badges anzeigen · {count}/4",
    hideGear: "GEAR Skill Badges ausblenden · {count}/4",
  },
  es: {
    completedTitle: "Bonus Milestone completado",
    bonusApplied:
      "+10 de bonus aplicados. Abre los detalles para revisar los pasos completados.",
    completionSaved:
      "El estado de finalización se ha guardado. Puedes cerrar los detalles de nuevo o deshacerlo si hace falta.",
    confirmCompleted:
      "Confirma después de completar todos los pasos obligatorios anteriores.",
    openDetails: "Abrir detalles",
    closeDetails: "Cerrar detalles",
    undo: "Deshacer",
    markCompleted: "Marcar como completado",
    viewGear: "Ver los 4 Skill Badges GEAR · {count}/4",
    hideGear: "Ocultar los Skill Badges GEAR · {count}/4",
  },
  pt_BR: {
    completedTitle: "Bonus Milestone concluído",
    bonusApplied:
      "+10 de bônus aplicados. Abra os detalhes para revisar as etapas concluídas.",
    completionSaved:
      "O status de conclusão foi salvo. Você pode fechar os detalhes novamente ou desfazer, se necessário.",
    confirmCompleted:
      "Confirme depois de concluir todas as etapas obrigatórias acima.",
    openDetails: "Abrir detalhes",
    closeDetails: "Fechar detalhes",
    undo: "Desfazer",
    markCompleted: "Marcar como concluído",
    viewGear: "Ver os 4 Skill Badges GEAR · {count}/4",
    hideGear: "Ocultar os Skill Badges GEAR · {count}/4",
  },
  it: {
    completedTitle: "Bonus Milestone completato",
    bonusApplied:
      "+10 bonus applicati. Apri i dettagli per rivedere i passaggi completati.",
    completionSaved:
      "Lo stato di completamento è stato salvato. Puoi richiudere i dettagli o annullare se necessario.",
    confirmCompleted:
      "Conferma dopo aver completato tutti i passaggi obbligatori sopra.",
    openDetails: "Apri dettagli",
    closeDetails: "Chiudi dettagli",
    undo: "Annulla",
    markCompleted: "Segna come completato",
    viewGear: "Mostra i 4 Skill Badge GEAR · {count}/4",
    hideGear: "Nascondi gli Skill Badge GEAR · {count}/4",
  },
  ru: {
    completedTitle: "Bonus Milestone завершен",
    bonusApplied:
      "+10 бонусных баллов применено. Откройте детали, чтобы проверить выполненные шаги.",
    completionSaved:
      "Статус выполнения сохранен. Можно снова закрыть детали или отменить отметку при необходимости.",
    confirmCompleted:
      "Подтвердите после выполнения всех обязательных шагов выше.",
    openDetails: "Открыть детали",
    closeDetails: "Закрыть детали",
    undo: "Отменить",
    markCompleted: "Отметить как выполненное",
    viewGear: "Показать 4 GEAR Skill Badges · {count}/4",
    hideGear: "Скрыть GEAR Skill Badges · {count}/4",
  },
  ar: {
    completedTitle: "اكتمل Bonus Milestone",
    bonusApplied:
      "تم تطبيق مكافأة +10. افتح التفاصيل لمراجعة الخطوات المكتملة.",
    completionSaved:
      "تم حفظ حالة الإكمال. يمكنك إغلاق التفاصيل مرة أخرى أو التراجع عند الحاجة.",
    confirmCompleted: "أكّد بعد إكمال جميع الخطوات المطلوبة أعلاه.",
    openDetails: "فتح التفاصيل",
    closeDetails: "إغلاق التفاصيل",
    undo: "تراجع",
    markCompleted: "وضع علامة كمكتمل",
    viewGear: "عرض 4 شارات مهارات GEAR · {count}/4",
    hideGear: "إخفاء شارات مهارات GEAR · {count}/4",
  },
  hi: {
    completedTitle: "Bonus Milestone पूरा हुआ",
    bonusApplied:
      "+10 bonus लागू हो गया है। पूरे किए गए चरणों की समीक्षा के लिए विवरण खोलें।",
    completionSaved:
      "Completion status सेव हो गया है। आप विवरण फिर से बंद कर सकते हैं या जरूरत होने पर undo कर सकते हैं।",
    confirmCompleted:
      "ऊपर दिए गए सभी जरूरी चरण पूरे करने के बाद ही पुष्टि करें।",
    openDetails: "विवरण खोलें",
    closeDetails: "विवरण बंद करें",
    undo: "Undo",
    markCompleted: "पूरा हुआ चिह्नित करें",
    viewGear: "4 GEAR Skill Badges देखें · {count}/4",
    hideGear: "GEAR Skill Badges छिपाएँ · {count}/4",
  },
}

export function applyFacilitatorBonusMilestoneControlTranslations(catalogs) {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    catalog.additional ??= {}
    const target = TRANSLATIONS[locale] ?? {}

    for (const [key, source] of Object.entries(SOURCES)) {
      if (locale !== "en" && !Object.hasOwn(target, key)) {
        throw new Error(
          `Missing Bonus Milestone control translation ${locale}.${key}`,
        )
      }
      catalog.additional[source] = target[key] ?? source
    }

    if (locale !== "en" && (!target.viewGear || !target.hideGear)) {
      throw new Error(
        `Missing Bonus Milestone GEAR toggle translation ${locale}`,
      )
    }

    for (let count = 0; count <= 4; count += 1) {
      const sourceView = `View 4 GEAR skill badges · ${count}/4`
      const sourceHide = `Hide GEAR skill badges · ${count}/4`
      catalog.additional[sourceView] =
        locale === "en"
          ? sourceView
          : target.viewGear.replace("{count}", String(count))
      catalog.additional[sourceHide] =
        locale === "en"
          ? sourceHide
          : target.hideGear.replace("{count}", String(count))
    }
  }
}
