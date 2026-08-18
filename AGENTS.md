# Repository Instructions

## Internationalization

- Translation source is organized by locale, not by feature.
- Each supported language must have its own source file under `public/i18n/locales/<locale>.json` (for example `en.json`, `vi.json`, `ja.json`).
- Never add a feature-specific translation file that contains multiple languages in one JSON/JS/MJS file.
- Never hardcode translated UI copy in component logic or translation scripts.
- When adding or changing UI text, update the corresponding key in every supported locale file and keep the same key set across all locale files.
- Preserve runtime placeholders such as `{count}` in every locale.
- `scripts/generate-website-i18n.mjs` may merge/expand locale source files into generated runtime catalogs, but the human-maintained translation source must remain one file per language.
- Tests should fail when a locale file is missing, a key is missing, or a required placeholder is dropped.

Existing legacy translation helpers may remain until migrated, but new or modified translation work must follow the per-locale-file structure above.
