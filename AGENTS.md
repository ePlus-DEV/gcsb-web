# Repository Instructions

## Internationalization

- Human-maintained translation source lives in `public/i18n/locales/`.
- Each supported language has exactly one complete source catalog: `public/i18n/locales/<locale>.json` (for example `en.json`, `vi.json`, `ja.json`).
- Do not store translation source as gzip/base64, split catalog parts, compressed blobs, or generated opaque payloads.
- Do not add feature-specific translation files that contain multiple languages in one JSON/JS/MJS file.
- Do not hardcode translated UI copy in component logic or translation scripts.
- When adding or changing UI text, update the corresponding entry in every supported locale file and keep the same catalog key set across all locale files.
- Preserve runtime placeholders such as `{count}`, `{bonus}`, `{value}`, and other `{...}` tokens in every locale.
- `scripts/generate-website-i18n.mjs` only validates the readable locale source files and writes the runtime catalogs to `public/i18n/<locale>.json`; translation content must not live in that script.
- Files generated at `public/i18n/<locale>.json` are build/runtime output. Do not edit or commit them; edit `public/i18n/locales/<locale>.json` instead.
- Tests must fail when a locale file is missing, catalog keys diverge, placeholders are dropped, or compressed/multi-locale translation sources are introduced.
