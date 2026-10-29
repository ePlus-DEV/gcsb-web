# Home and Dashboard

Implementation reference: the October 29 **Cyber Pixel Arcade UI Showcase** design board (dark desktop/mobile Home and Dashboard), preserving the existing Press Start 2P / Inter font setup, theme tokens, icons and seasonal skin.

- `/` and every locale Home remain public discovery pages: profile URL form, extension, live tiers, monthly games, swag and compact guidance. Home shows only a compact saved-profile summary below the form and never imports the personal results page or requests personal scores. The summary reuses Dashboard scoring and participation preferences, with one row on desktop and two rows on mobile.
- A valid profile navigates to `/dashboard/?profile=...` (or the selected locale route). Only Dashboard requests the score. The URL handoff works without local storage; a direct Dashboard visit restores the previous optional browser snapshot.
- Dashboard starts with compact profile and two balanced total-points / score-eligibility panels; Facilitator bonus is included in the score breakdown, followed by an eight-badge preview and recent/goal/confidence panels. Desktop tier information stays sticky beside these panels. The Facilitator launcher is embedded in the profile row, retaining its drawer and focus behavior instead of floating outside the Dashboard. Profile controls, score breakdown and allocation details remain visible without expansion. Allocation uncertainty is an inline note that works on touch screens without hover; only supplementary history and program details use dialogs/disclosure controls.
- Shared header/footer/extension and live-tier hook avoid duplicated implementations. Language changes preserve Dashboard, query and hash. Next Link preserves preview base paths. Shared profile and widget routes keep their existing behavior.
- All 13 locale catalogs own the new navigation and validation labels. Dashboard routes are statically exported and noindexed with their own canonical URLs.

The board's 118-point sample is not hardcoded as live data. Product artwork comes from the existing confirmed swag catalog; public capacities are never presented as remaining slots when the live feed fails. Existing Facilitator calculations remain unchanged. Reward prediction / Waterfall remains separate in PR #106.

Validation includes unit/i18n checks, typecheck, lint, static export, SEO/analytics export checks and the adapted Home-to-Dashboard browser regressions. Successful checks persist checkedAt; restoring an existing snapshot never changes that timestamp. Older snapshots show a saved-result label without inventing a check time. Invalid or unavailable storage leaves the form usable.

Browser fixtures deliberately isolate API/remote-feed availability from UI and routing behavior.

## UI consistency review (2026-10-29)

- The site uses a common 1280px outer page grid. Guest Dashboard intentionally uses one centered, matching 1000px form-and-tiers column (no mismatched 800px/1000px cards), while the results-heavy Profile Dashboard retains full-width panels and a right sidebar.
- Public tiers use one highest-first ordering and the same heading/icon/slot layout in Home and Guest Dashboard. Home may still show the extra reward artwork, which is hidden at phone widths to keep cards compact.
- Profile header reserves space for the Share control and gives the Facilitator launcher a fluid column; narrow-screen profile cards return to full-width stacked actions.
- Confirm at 390px, 768px, 1024px and 1440px for dark/light and at least English/Vietnamese + a long translation. This source-level change does not replace real browser visual regression checks.

## Seasonal labeling scope

The `Halloween edition` pill belongs exclusively to Home's promotional hero when the Halloween season is active. Neither Guest Dashboard nor Profile Dashboard renders the pill, even while retaining the seasonal background palette. Dashboard uses its own compact and translated page heading; the shared profile form stays below the heading. Browser tests assert the pill never appears on Dashboard. No font, color theme or score logic changes are needed for this rule.

## Facilitator button behavior

- The tracker opens from the Profile header and remains visible for both enabled and disabled Facilitator participation; opening a tracker is not an opt-in.
- The drawer and analyzer now use the shared participation state/event, and opting in/out no longer remounts or closes the drawer.
- The button is not rendered as a floating action in Guest mode. Phone/desktop browser regressions cover opening, opt-in, opt-out and closing.

## Floating Facilitator control (review 2026-10-29)

Previous inline button positioning was incorrect: route-layout.css overrode fixed positioning with position: static and placed the tracker beneath the Share action. The control now portals directly into document.body only when Profile Dashboard is mounted. At widths >=1750px a full label sits in the right gutter; on smaller screens it is a compact 48–52px accessible rail action (hover/focus expands it on desktops). The launcher stays fixed during scrolling and no longer shifts profile card layout. Browser checks assert fixed positioning and constant viewport Y coordinate through full-page scrolling. Drawer and participation behavior remain unchanged.

## Mobile ergonomics follow-up (2026-10-29)

- Floating Facilitator is a 44px icon-only FAB, bottom 132px plus safe-area, stacked above Back to top at 82px and above the mobile bottom nav. No middle-right rail on phones.
- Dashboard input and Analyze button share 46px desktop and 44px mobile heights. Mobile action width stays full for accessible tapping but with less vertical weight.
- Guest and Profile dashboard content share a 1200px maximum width and consistent outer gutters; both preview switch buttons occupy equal columns with no special width for the selected tab.
- On mobile, the saved profile identity has no 240px flex-basis; the avatar starts near the top instead of after empty space.
- Browser tests assert control height, balanced switch widths, compact profile identity, fixed FAB and scroll position. Home, score logic and seasonal fonts/palette remain unchanged.

## Shared Analyze profile UI (2026-10-29)
- Home and Dashboard render the same `ProfileAnalyzer`; historical route-specific CSS had changed Home to 54px controls and Dashboard to 46/44px.
- A shared analyzer control token now sets 46px on desktop and 44px on phone, with identical radius, typography, button min-width, card padding and help-row spacing.
- Home stays centered within the hero (up to 1000px), while Dashboard follows the 1200px score grid. This is intentional layout hierarchy, not a different component.
- Saved-profile and auto-fetch/Facilitator controls remain Dashboard-only because Home submits the URL and navigates to the Dashboard without fetching profile data.
- Home clears a stale invalid-URL error while the user edits input.
- Browser checks compare computed styles at 390 and 1440 widths for dark and light themes.

The shared analyzer's step label is also visible in Profile Dashboard. Browser regressions cover Home, Guest Dashboard and Profile Dashboard across 390px/1440px and dark/light modes; Dashboard-only Facilitator/auto-fetch options remain intact.

## Home profile URL restoration (2026-10-29)

Home's Analyze form now hydrates its URL from the same validated `eplus-arcade-dashboard-v1.profileUrl` record used by Dashboard; unlike Dashboard it never auto-fetches a score. The lightweight reader imports only model constants, avoiding the preview fixture/score bundle. Home leaves the input empty if storage is absent, blocked or malformed and does not overwrite a user-edited or cleared value when focus/pageshow/storage events run. Browser regression covers both English/Vietnamese paths, desktop/mobile widths, restored/empty URLs and deliberate edits.
