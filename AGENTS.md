# Repository Instructions

## Logo and brand artwork — locked; explicit owner approval required

**Do not modify, replace, regenerate, restyle, resize, reposition, or otherwise affect the existing Arcade Points logo without the repository owner's explicit approval for that specific change.** This rule applies to manual work, AI agents, automated refactors, scheduled tasks, and PRs.

- Preserve the current logo artwork, icon/symbol, ARCADE POINTS wordmark, colors, proportions, spacing, alignment, and rendering across desktop and mobile. Do not create or propose alternate logos or fresh artwork by default.
- Do not edit logo assets/components, their SVG paths, branding styles, or CSS selectors affecting the logo. This also covers indirect changes to shared header/footer layout, fonts, icon systems, responsive breakpoints, theming, build tooling, or dependencies if they could alter its appearance.
- For unrelated UI changes, explicitly ensure that the existing logo renders unchanged on desktop and mobile, including light/dark modes and every page that reuses it. Avoid incidental logo diffs in screenshots or visual regression baselines.
- If a requested change could affect the logo, **leave it untouched and request explicit owner approval before making any change**. A general UI improvement, a reported alignment issue, a previous approval, or an automated task is **not** permission to redesign or modify the logo.
- Never silently bypass this rule or automatically merge a logo-related PR. Do not treat code-only/CSS-only edits as exempt: the visible logo must remain identical unless expressly approved.

## Internationalization — mandatory merge gate

This website is **always multilingual**. Internationalization is not optional and is not a follow-up task.

- **Every user-visible UI change must support every currently supported locale in the same PR.**
- This applies to all visible or assistive copy: headings, descriptions, buttons, links, empty states, loading states, error messages, status text, badges, tooltips, dialogs, placeholders, `title`, `aria-label`, notifications, preview-only UI, and newly introduced dynamic text.
- **Do not consider a feature complete and do not merge it if any newly added or changed user-facing copy is English-only.**
- Do not temporarily hardcode English with the intention of translating it later. Temporary/preview states must follow the same i18n rules as production UI.
- Human-maintained translation source lives in `public/i18n/locales/`.
- Each supported language has exactly one complete source catalog: `public/i18n/locales/<locale>.json` (for example `en.json`, `vi.json`, `ja.json`).
- When adding or changing user-facing text, update the corresponding entry in **every supported locale file**, not only English. Existing locale-specific legacy entries may remain until they are migrated, but do not introduce new locale-only source patterns.
- Prefer catalog keys/templates for dynamic copy. Preserve runtime placeholders such as `{count}`, `{bonus}`, `{value}`, `{month}`, and other `{...}` tokens in every locale.
- Dates, months, times, and relative-time text must be locale-aware. When the product/source timezone defines the semantic month or deadline, format using that source timezone rather than the viewer/browser timezone.
- Do not store translation source as gzip/base64, split catalog parts, compressed blobs, or generated opaque payloads.
- Do not add feature-specific translation files that contain multiple languages in one JSON/JS/MJS file.
- Do not hardcode translated UI copy in component logic or translation scripts.
- New or changed TS/TSX UI must render user-facing copy through stable catalog keys/helpers. English source text belongs in `public/i18n/locales/en.json`, not as JSX/string literals and not as the translation key itself.
- Add regression coverage for changed UI so CI fails when catalog-owned English copy is reintroduced into the component.
- `scripts/generate-website-i18n.mjs` only validates the readable locale source files and writes the runtime catalogs to `public/i18n/<locale>.json`; translation content must not live in that script.
- Files generated at `public/i18n/<locale>.json` are build/runtime output. Do not edit or commit them; edit `public/i18n/locales/<locale>.json` instead.
- Before completing a UI PR, run the i18n generator/tests and verify at least English plus one non-English locale in the affected UI.
- Tests must fail when a locale source file is missing, required shared UI copy is missing, placeholders are dropped, or compressed/multi-locale translation sources are introduced.

## Design-system colors and light/dark mode — mandatory merge gate

The canonical palette and UI rules are in **[docs/ui/DESIGN_SYSTEM.md](docs/ui/DESIGN_SYSTEM.md)**, implemented as semantic tokens in `app/styles/design-tokens.css`.

- **Violet is the only primary interaction color** for new UI. Cyan/teal is secondary; green/amber/rose are status colors only; tier/chart colors remain categorical. Gold in the **locked Arcade logo** is not permission to modify or reinterpret logo artwork.
- New UI colors **MUST** use `var(--ds-...)` tokens. No new raw HEX/RGB/HSL color values or raw Tailwind palette utilities in UI source without a same-line `design-color-exception: reason` annotation, documented in the PR. The incremental CI guard rejects violations; unchanged legacy colors are grandfathered.
- Every visible UI change **MUST** be verified in both `html.light` and `html.dark`, including button hover/active, breadcrumbs, inputs, cards, overlays, icons and responsive states. Minimum contrast targets: WCAG AA 4.5:1 normal text, 3:1 large text and essential UI indicators.
- Do not replace primary violet with unrelated cyan/green/blue CTAs, even if contrast passes. Do not make a theme change that affects the locked logo.
- Include light/dark desktop/mobile screenshots in UI PRs, and check `node scripts/design-color-guard.mjs --base origin/main` plus unit/browser tests. Do not batch-rewrite legacy colors as part of unrelated changes.
