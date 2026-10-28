# Arcade interface refresh

A UI-only change based on main after PR #105. It does not include or depend on the tier-prediction feature in #106.

## Layout

The guest journey is profile entry, program dates, reward availability and monthly games. Installation follows the main content. The profile journey introduces one primary score card, identity/badge statistics and a next-goal card before the earned-badge collection. Eligibility/queue details remain available in a native disclosure. Game-history popovers, tier-slot history, share/reset and Facilitator enhancements keep their existing anchors and behavior.

## Visual system

`app/styles/interface-refresh.css` owns the calculator's palette and presentation under `.arcade-ui-refresh`. Dark navy surfaces, a yellow primary action, restrained violet supporting accents, readable secondary text, an 18px panel radius and 16/20/24px spacing replace competing gradients. Light mode uses the same hierarchy on white surfaces. The Arcade pixel wordmark/English hero, translated font fallback, tier/status colors and seasonal decoration remain.

Desktop uses a two-column score/identity overview and a badge grid with a tier sidebar. Tablet uses a full-width score plus paired supporting panels. Mobile stacks panels, keeps navigation edge-to-edge, uses 44px interaction targets and respects safe-area insets. Long labels may wrap, and badge filters scroll horizontally within their own group.

## Reuse

- `ProfileAnalyzer`: catalog-driven entry form with linked label, busy/invalid/error states, submit/reset handlers and stable enhancer anchors. It owns no scoring or fetching logic.
- `DashboardPanel`: semantic article shell sharing the dashboard surface style; accepts native article props.
- `SectionTitle`: section heading with shared typography and native h2 props.
- `MetricStat`: localized value/label pair with an optional decorative icon.
- Existing `ArcadeSurface`, `ArcadeMetric` and Radix UI primitives remain available. No additional component dependency is introduced.

All edited labels reuse source catalog keys in all 13 locales. Numerical calculations, API requests and tier thresholds are unchanged. Mobile menu Escape returns focus to its toggle; opening/closing remains a nonmodal navigation interaction.

## Review

Check guest/profile, light/dark and English/Vietnamese/German layouts at 320, 390, 768, 1024 and 1440px. Verify profile analysis, error/loading, reset, navigation, copy code, deadlines, history, bonus controls and share behavior. Existing browser regression scripts retain these flows and use the updated placement/color expectations. Palette tests cover text and primary-action contrast; semantic tests cover label/input linkage and catalog-owned UI copy.
