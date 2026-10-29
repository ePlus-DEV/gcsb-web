# Home and Dashboard

Implementation reference: the October 29 **Cyber Pixel Arcade UI Showcase** design board (dark desktop/mobile Home and Dashboard), preserving the existing Press Start 2P / Inter font setup, theme tokens, icons and seasonal skin.

- `/` and every locale Home remain public discovery pages: profile URL form, extension, live tiers, monthly games, swag and compact guidance. Home never restores personal data or imports the personal results component.
- A valid profile navigates to `/dashboard/?profile=...` (or the selected locale route). Only Dashboard requests the score. The URL handoff works without local storage; a direct Dashboard visit restores the previous optional browser snapshot.
- Dashboard starts with compact profile and two balanced total-points / score-eligibility panels; Facilitator bonus is included in the score breakdown, followed by an eight-badge preview and recent/goal/confidence panels. Desktop tier information stays sticky beside these panels. Profile controls, score breakdown and allocation details remain visible without expansion. Allocation uncertainty is an inline note that works on touch screens without hover; only supplementary history and program details use dialogs/disclosure controls.
- Shared header/footer/extension and live-tier hook avoid duplicated implementations. Language changes preserve Dashboard, query and hash. Next Link preserves preview base paths. Shared profile and widget routes keep their existing behavior.
- All 13 locale catalogs own the new navigation and validation labels. Dashboard routes are statically exported and noindexed with their own canonical URLs.

The board's 118-point sample is not hardcoded as live data. Product artwork comes from the existing confirmed swag catalog; public capacities are never presented as remaining slots when the live feed fails. Existing Facilitator calculations remain unchanged. Reward prediction / Waterfall remains separate in PR #106.

Validation includes unit/i18n checks, typecheck, lint, static export, SEO/analytics export checks and the adapted Home-to-Dashboard browser regressions. Browser fixtures deliberately isolate API/remote-feed availability from UI and routing behavior.
