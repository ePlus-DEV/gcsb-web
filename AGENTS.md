# Repository Instructions

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
- `scripts/generate-website-i18n.mjs` only validates the readable locale source files and writes the runtime catalogs to `public/i18n/<locale>.json`; translation content must not live in that script.
- Files generated at `public/i18n/<locale>.json` are build/runtime output. Do not edit or commit them; edit `public/i18n/locales/<locale>.json` instead.
- Before completing a UI PR, run the i18n generator/tests and verify at least English plus one non-English locale in the affected UI.
- Tests must fail when a locale source file is missing, required shared UI copy is missing, placeholders are dropped, or compressed/multi-locale translation sources are introduced.
