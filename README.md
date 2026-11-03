# gcsb-web

Google Cloud Skills Boost - Helper - Website

## Arcade widget embed

The widget is designed to work with an iframe-only embed. To let the widget receive the full embedding page URL through `document.referrer`, set an explicit iframe referrer policy:

```html
<iframe
  src="https://arcade.eplus.dev/widget"
  title="Arcade Points Widget"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

For normal HTTPS pages embedding the HTTPS widget, this allows the parent page URL to be exposed to the iframe as the referrer. The widget removes the query string and hash before forwarding the source URL to outbound links.

The widget still supports `?source_url=` as the highest-priority explicit override.

Without a referrer policy that exposes the path, browsers may apply `strict-origin-when-cross-origin`, in which case a cross-origin iframe can only see the parent origin rather than the full page path.

## UI design system and color rules

**Canonical guide:** [docs/ui/DESIGN_SYSTEM.md](docs/ui/DESIGN_SYSTEM.md). New styles must use semantic tokens defined in `app/styles/design-tokens.css`, with violet for primary actions and theme-aware surfaces/text. The existing Arcade Points logo is locked by [AGENTS.md](AGENTS.md).

- `node scripts/design-color-guard.mjs --base origin/main` — reject newly added hardcoded colors or raw palette classes (fetch `origin/main` first).
- `yarn test:unit` — run the color guard regression tests with the existing unit tests.
- Visible UI PRs need light/dark screenshots and must pass the CI design-color gate; existing legacy colors are not automatically rewritten.
