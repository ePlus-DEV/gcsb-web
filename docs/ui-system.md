# Site UI system

Full-page routes use `SiteHeader` and `SiteFooter`. This includes the calculator,
content/Swag pages, shared score loading/error/success states, and 404 redirects.
The iframe widget intentionally keeps compact chrome and its own theme preference.

`app/styles/ui-tokens.css` is the shared theme contract. Define neutral colors,
container width, gutters, corner radii, focus colors, shadows and overlay layers
there. Dark and light override HSL channels rather than duplicating components.
The same channels supply the existing Tailwind/Radix primitives. Primary action
backgrounds use `--ui-primary`; accent text uses `--ui-accent` for readable contrast.

`app/styles/site-ui.css` owns common presentation. Layout/data-specific styles stay
with their feature. Home `--v2-*` and shared score `--sp-*` aliases resolve shared
tokens. `widget-system.css` applies the contract after legacy embed layout CSS.
Tier colors, history series and semantic completed/pending/error colors remain
meaningful; they are not substitutes for the neutral surface palette.

Use `site-surface` for bordered neutral cards and semantic Tailwind colors
(`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) for content.
Keep full-page content inside `--ui-width` / `--ui-gutter`. Avoid additional nested
borders, glow, gradients or feature-specific light palettes for neutral cards.
Use the existing Button/Input/Card/Dialog primitives for new controls and overlays.

Chrome renders stable `messages` catalog keys. All 13 catalogs must contain shared
keys. Language changes update the chrome through `data-locale`, including content
routes without locale segments. Do not reintroduce DOM-injected navigation links.

Validation:

```sh
npm run generate:i18n
npm run test:unit
npm run typecheck
npm run build
# With a dev/production/preview server running:
UI_BASE_URL=http://127.0.0.1:3086 node scripts/verify-site-ui.mjs
```

The browser script mocks external profile/availability responses and blocks third
party requests. It verifies route coverage, dark/light, English/Vietnamese,
mobile/desktop overflow, keyboard menu dismissal, data-bearing calculator tiers,
and dialogs. Optional `UI_SCREENSHOT_DIR` records screenshots. External fonts,
remote images and live feed freshness need separate deployed-preview inspection.
