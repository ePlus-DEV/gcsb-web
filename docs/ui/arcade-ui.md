# Arcade UI

The first migration covers shared reward tiers in both guest and profile dashboards.

## Review findings

The live home page uses many competing gradients, borders and small labels. Keep the pixel wordmark and seasonal art, but use quieter surfaces for data. Prioritize the profile analyzer, then score/progress, reward availability and monthly games. Secondary installation and program notices should remain visually subordinate.

## Reusable primitives

- `ArcadeSurface`: neutral bordered container. Accepts standard div attributes and children; never adds click behavior to informational cards.
- `ArcadeMetric`: tabular numeric container for slot counts and future score statistics.
- Existing `components/ui/button`, `input`, `dialog`, `tabs` and other Radix primitives remain the interaction foundation. Avoid introducing a second button or dialog API.

Import primitives from `components/arcade/ui/surface`. Styles load once in the root layout. Tokens are scoped to `.arcade-dashboard-page` and inherit existing light/dark palette values. Override `--ui-space`, `--ui-radius` or `--ui-surface` on a containing element for bounded variants.

Callers own all catalog-driven labels and accessibility attributes. Do not place English defaults in these primitives. Reward cards keep existing live data, history and locale handling. Mobile keeps compact rows; wider screens retain the four-card overview. Current tier uses a border and inset marker without suggesting other cards are clickable.

## Next migrations

Apply surfaces to monthly game cards and profile statistics after reviewing their density. Consolidate analyzer loading, invalid URL and unavailable profile states using existing localized copy. Audit light/dark themes at 360, 768 and 1440 pixels, keyboard focus, long translations and reduced motion before a wider rollout.
