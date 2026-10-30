import type { WebsiteLocale } from "@/lib/website-i18n"

type Faq = {
  title: string
  description: string
  questions: [string, string, string, string, string, string]
  answers: [string, string, string, string, string, string]
}

/* Landing-only FAQ translations. These are not reward rules or live availability claims. */
export const LANDING_FAQ: Partial<Record<WebsiteLocale, Faq>> = {
  ja: {
    title: "よくある質問", description: "ePlus Arcade と Google Cloud Arcade に関する質問です。",
    questions: ["データはどこから取得しますか？","ポイントはどう計算しますか？","報酬ランクの予測方法は？","報酬はいつ確定しますか？","拡張機能は必須ですか？","情報はどのくらいの頻度で更新されますか？"],
    answers: [
      "公開された Google Skills プロフィールと、利用可能な Arcade プログラム情報を使用します。Google 公式ツールではありません。",
      "対象のバッジを現在対応しているルールに従って分類します。例外やデータ不足は手動確認が必要な場合があります。",
      "公開されたポイント基準や残り枠と比較します。実際の順番は分からず、報酬を保証するものではありません。",
      "報酬を確定できるのは主催者だけです。基準点の達成だけで受け取りは確約されません。",
      "必須ではありません。公開プロフィール URL で Dashboard を使えます。",
      "更新頻度はデータ元により異なります。データがない場合は Dashboard に表示します。",
    ],
  },
  ko: {
    title: "자주 묻는 질문", description: "ePlus Arcade와 Google Cloud Arcade에 대한 안내입니다.",
    questions: ["데이터는 어디에서 가져오나요?","포인트는 어떻게 계산하나요?","보상 등급은 어떻게 예측하나요?","보상은 언제 확정되나요?","확장 프로그램이 꼭 필요한가요?","정보는 얼마나 자주 갱신되나요?"],
    answers: [
      "공개 Google Skills 프로필과 제공되는 Arcade 프로그램 정보를 사용합니다. Google 공식 도구는 아닙니다.",
      "현재 지원하는 규칙에 따라 해당 배지를 분류합니다. 예외나 누락된 정보는 직접 확인해야 할 수 있습니다.",
      "공개된 등급 기준 및 잔여 수량과 비교합니다. 개인 대기 순서는 알 수 없으며 보상을 보장하지 않습니다.",
      "보상 확정은 주최 측에서만 할 수 있습니다. 기준 점수 달성이 곧 보상 확정을 뜻하지는 않습니다.",
      "필수는 아닙니다. 공개 프로필 URL만으로 Dashboard를 사용할 수 있습니다.",
      "데이터 출처에 따라 다릅니다. 정보가 없으면 Dashboard에서 안내합니다.",
    ],
  },
  zh_CN: {
    title: "常见问题", description: "关于 ePlus Arcade 和 Google Cloud Arcade 的常见解答。",
    questions: ["数据来自哪里？","Arcade 积分如何计算？","如何预测奖励等级？","奖励什么时候确认？","必须安装扩展程序吗？","信息多久更新一次？"],
    answers: [
      "使用公开的 Google Skills 个人资料和可获取的 Arcade 项目信息。本工具并非 Google 官方产品。",
      "按当前支持的规则分类符合条件的徽章。特殊情况和缺失数据可能需要人工检查。",
      "将积分与公开的等级门槛及剩余名额比较。无法获知个人排队顺序，也不能保证获奖。",
      "只有活动主办方可以确认奖励。达到积分门槛不代表一定能获得奖励。",
      "不需要。通过公开个人资料链接即可使用 Dashboard。",
      "更新频率取决于数据来源。缺失信息会在 Dashboard 中提示。",
    ],
  },
  fr: {
    title: "Questions fréquentes", description: "Réponses sur ePlus Arcade et Google Cloud Arcade.",
    questions: ["D’où proviennent les données ?","Comment les points sont-ils calculés ?","Comment estimer le niveau de récompense ?","Quand les récompenses sont-elles confirmées ?","L’extension est-elle obligatoire ?","À quelle fréquence les données changent-elles ?"],
    answers: [
      "Nous utilisons votre profil Google Skills public et les informations Arcade disponibles. Ce service est indépendant de Google.",
      "Les badges admissibles sont classés selon les règles actuellement prises en charge. Certains cas demandent une vérification manuelle.",
      "Le Dashboard compare les points aux seuils et aux places publiées. Il ne connaît pas votre rang exact et ne garantit aucune récompense.",
      "Seul l’organisateur confirme les récompenses. Atteindre un seuil ne garantit pas de recevoir un lot.",
      "Non. Un lien vers un profil public suffit pour utiliser le Dashboard.",
      "Cela dépend des sources. Les informations indisponibles sont signalées dans le Dashboard.",
    ],
  },
  de: {
    title: "Häufig gestellte Fragen", description: "Antworten zu ePlus Arcade und Google Cloud Arcade.",
    questions: ["Woher stammen die Daten?","Wie werden Arcade-Punkte berechnet?","Wie funktioniert die Rangprognose?","Wann werden Prämien bestätigt?","Muss ich die Erweiterung installieren?","Wie oft werden die Daten aktualisiert?"],
    answers: [
      "Wir verwenden dein öffentliches Google-Skills-Profil und verfügbare Arcade-Programminformationen. Dies ist kein offizielles Google-Produkt.",
      "Berechtigte Badges werden nach den aktuell unterstützten Regeln bewertet. Sonderfälle können eine manuelle Prüfung erfordern.",
      "Das Dashboard vergleicht Punkte mit veröffentlichten Schwellen und Plätzen. Die persönliche Warteschlangenposition ist unbekannt; eine Prämie ist nicht garantiert.",
      "Nur der Veranstalter kann Prämien bestätigen. Das Erreichen einer Punkteschwelle ist keine Zusage.",
      "Nein. Das Dashboard funktioniert auch nur mit einem öffentlichen Profil-Link.",
      "Die Häufigkeit hängt von der Quelle ab. Fehlende Daten werden im Dashboard gekennzeichnet.",
    ],
  },
  es: {
    title: "Preguntas frecuentes", description: "Respuestas sobre ePlus Arcade y Google Cloud Arcade.",
    questions: ["¿De dónde salen los datos?","¿Cómo se calculan los puntos?","¿Cómo funciona la predicción de nivel?","¿Cuándo se confirman los premios?","¿Necesito instalar la extensión?","¿Cada cuánto se actualiza la información?"],
    answers: [
      "Usamos tu perfil público de Google Skills y la información disponible de Arcade. No es una herramienta oficial de Google.",
      "Los badges válidos se clasifican según las reglas compatibles. Algunos casos requieren revisión manual.",
      "El Dashboard compara tus puntos con los umbrales y cupos publicados. No conoce tu posición exacta ni garantiza premios.",
      "Solo el organizador confirma la entrega. Alcanzar un umbral de puntos no garantiza un premio.",
      "No. Basta con la URL de tu perfil público para usar el Dashboard.",
      "Depende de cada fuente. El Dashboard indica cuándo faltan datos.",
    ],
  },
  pt_BR: {
    title: "Perguntas frequentes", description: "Respostas sobre o ePlus Arcade e o Google Cloud Arcade.",
    questions: ["De onde vêm os dados?","Como os pontos são calculados?","Como funciona a previsão de categoria?","Quando os prêmios são confirmados?","Preciso instalar a extensão?","Com que frequência os dados são atualizados?"],
    answers: [
      "Usamos seu perfil público do Google Skills e informações disponíveis do Arcade. Esta não é uma ferramenta oficial do Google.",
      "Os badges elegíveis são classificados conforme as regras atualmente suportadas. Alguns casos exigem revisão manual.",
      "O Dashboard compara pontos com limites e vagas publicados. Não conhece sua posição exata nem garante prêmios.",
      "Somente o organizador confirma as premiações. Atingir a pontuação não garante um prêmio.",
      "Não. Basta a URL do perfil público para usar o Dashboard.",
      "Depende da fonte. O Dashboard informa quando não há dados disponíveis.",
    ],
  },
  it: {
    title: "Domande frequenti", description: "Risposte su ePlus Arcade e Google Cloud Arcade.",
    questions: ["Da dove provengono i dati?","Come si calcolano i punti Arcade?","Come funziona la previsione dei livelli?","Quando vengono confermati i premi?","Devo installare l’estensione?","Quanto spesso vengono aggiornati i dati?"],
    answers: [
      "Usiamo il tuo profilo Google Skills pubblico e le informazioni Arcade disponibili. Non è uno strumento ufficiale di Google.",
      "I badge idonei sono classificati secondo le regole attualmente supportate. Alcuni casi richiedono una verifica manuale.",
      "La Dashboard confronta punti, soglie e posti pubblicati. Non conosce la tua posizione esatta e non garantisce premi.",
      "Solo l’organizzatore può confermare i premi. Raggiungere la soglia non garantisce un premio.",
      "No. Basta l’URL del profilo pubblico per usare la Dashboard.",
      "Dipende dalla fonte. I dati mancanti vengono segnalati nella Dashboard.",
    ],
  },
  ru: {
    title: "Частые вопросы", description: "Ответы о ePlus Arcade и Google Cloud Arcade.",
    questions: ["Откуда берутся данные?","Как рассчитываются баллы?","Как работает прогноз уровня наград?","Когда подтверждают награды?","Нужно ли устанавливать расширение?","Как часто обновляются данные?"],
    answers: [
      "Используются общедоступный профиль Google Skills и доступные данные Arcade. Это не официальный продукт Google.",
      "Подходящие значки учитываются по поддерживаемым правилам. В отдельных случаях нужна ручная проверка.",
      "Dashboard сопоставляет баллы с порогами и опубликованными местами. Точная очередь неизвестна, награда не гарантируется.",
      "Награды подтверждает только организатор. Нужное число баллов не гарантирует получение приза.",
      "Нет. Достаточно ссылки на публичный профиль для работы с Dashboard.",
      "Частота зависит от источника. Отсутствующие данные отмечаются в Dashboard.",
    ],
  },
  ar: {
    title: "الأسئلة الشائعة", description: "إجابات عن ePlus Arcade وGoogle Cloud Arcade.",
    questions: ["من أين تأتي البيانات؟","كيف تُحسب نقاط Arcade؟","كيف يعمل تقدير مستوى المكافأة؟","متى يتم تأكيد المكافآت؟","هل يجب تثبيت الإضافة؟","كم مرة تُحدَّث المعلومات؟"],
    answers: [
      "نستخدم ملف Google Skills العام ومعلومات Arcade المتاحة. هذه أداة مستقلة وليست منتجًا رسميًا من Google.",
      "تُصنف الشارات المؤهلة وفق القواعد المدعومة حاليًا. وقد تتطلب الحالات الخاصة مراجعة يدوية.",
      "تقارن لوحة المعلومات النقاط بالحدود والمقاعد المعلنة. لا نعرف ترتيبك الدقيق ولا نضمن المكافأة.",
      "لا يؤكد المكافآت إلا المنظم. بلوغ الحد المطلوب من النقاط لا يضمن الحصول على جائزة.",
      "لا. يكفي رابط ملفك العام لاستخدام لوحة المعلومات.",
      "يختلف ذلك حسب المصدر. تعرض لوحة المعلومات تنبيهًا عند غياب البيانات.",
    ],
  },
  hi: {
    title: "अक्सर पूछे जाने वाले प्रश्न", description: "ePlus Arcade और Google Cloud Arcade से जुड़े जवाब।",
    questions: ["डेटा कहाँ से आता है?","Arcade अंक कैसे गिने जाते हैं?","पुरस्कार स्तर का अनुमान कैसे लगता है?","पुरस्कार कब पक्के होते हैं?","क्या एक्सटेंशन ज़रूरी है?","जानकारी कितनी बार अपडेट होती है?"],
    answers: [
      "हम आपके सार्वजनिक Google Skills प्रोफ़ाइल और उपलब्ध Arcade जानकारी का उपयोग करते हैं। यह Google का आधिकारिक टूल नहीं है।",
      "योग्य बैज को अभी समर्थित नियमों के अनुसार गिना जाता है। कुछ मामलों में मैन्युअल जाँच ज़रूरी हो सकती है।",
      "Dashboard अंकों की तुलना प्रकाशित सीमा और उपलब्ध स्थानों से करता है। आपकी सही कतार स्थिति ज्ञात नहीं है और पुरस्कार की गारंटी नहीं है।",
      "पुरस्कार की पुष्टि केवल आयोजक करता है। तय अंक मिलने से पुरस्कार निश्चित नहीं होता।",
      "नहीं। सार्वजनिक प्रोफ़ाइल लिंक से ही Dashboard इस्तेमाल किया जा सकता है।",
      "यह डेटा स्रोत पर निर्भर है। जानकारी न मिलने पर Dashboard बताएगा।",
    ],
  },
}
