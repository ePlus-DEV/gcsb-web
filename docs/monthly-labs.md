# Monthly Labs pages

- `/monthly-labs/` lists all recorded months, newest first.
- `/monthly-labs/2026/09/` lists September's Arcade games and badge records.
- `/monthly-labs/2026/09/game-7441/` shows one game. Official game IDs supply stable
  slugs; reconstructed records without a game URL use a `badge-…` title slug.
- Missing months and slugs return 404. Routes and canonical URLs use two-digit months.

The source records describe Arcade games/badges, which can include multiple labs.
These pages display the source's description, code, points, deadline/time zone,
remaining-place snapshot and official links. They do not invent individual lab
steps or eligibility details absent from the source. Official titles/descriptions
stay in their original language, explicitly labeled; all interface copy supports
all 13 site locales. Month labels use the archived month, independent of browser
zone; deadlines use the recorded source zone (UTC when unavailable).

Historical records can be reconstructed and incomplete. Missing values are
identified; source `game_over`, past-month records and expired deadlines count as
ended even when an old snapshot says active. Ended games keep a reference link,
without an enrollment call to action. Place counts are labeled as captured data.

`data/monthly-labs.json` provides a checked-in offline baseline. `prebuild` runs
`scripts/sync-monthly-labs.mjs` to discover archived months and refresh them from
the existing feed repository. A source timeout, rate limit or invalid archive
retains the prior usable data; no missing month is fabricated. Run
`npm run sync:monthly-labs` to refresh and commit the baseline independently.
The script also produces `data/monthly-lab-routes.json`; the live home panel links
only to detail pages present in that deployment. Newly published games retain
an official link until the next successful build includes their archive.

Routes render SEO metadata, breadcrumb JSON-LD, month/item lists and sitemap
entries. `ContentCard`, `ContentLink`, `InternalPageShell` and theme tokens are
shared with editorial and Swag pages. Catalog-owned content avoids DOM translation
mutations while header/theme/language controls retain their existing behavior.

Verification:

```sh
npm run generate:i18n
npm run test:unit
npm run typecheck
npm run build
NEXT_STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/pr-preview/pr-87 npm run build
# On a production server with Chrome installed:
UI_BASE_URL=http://127.0.0.1:3000 node scripts/verify-monthly-labs.mjs
```

The existing i18n preview workflow runs the Monthly Labs browser checks in both
English/Vietnamese and dark/light themes at 320/390/1440px. It verifies archive
and detail rendering, clipboard, ended-game behavior, overflow and invalid routes.
