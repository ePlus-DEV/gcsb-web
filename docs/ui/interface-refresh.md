# Arcade component refactor

The established Arcade layout, typography, gradients, seasonal palette, panel sizes and content order are retained. The earlier visual redesign was withdrawn after review.

The PR now extracts ProfileAnalyzer, DashboardPanel, SectionTitle and MetricStat without introducing a new visual system. The analyzer keeps linked labels, busy/error semantics and locale-independent data anchors for Facilitator and fresh-score integrations. Header labels remain catalog-driven and Escape closes mobile navigation with focus restoration.

The mobile full-width fix from main remains. Slot history, profile sharing, game history, bonus controls, copy actions and scoring are unchanged. The invalid shared-profile workflow glob is corrected and regression coverage protects the stable input anchor.

## Profile dashboard visual balance

The badge gallery and the three existing insight cards now share the primary
profile column. The public tier/slot-history/swag panel remains in the sidebar.
Both columns size naturally rather than making the badge gallery as tall as the
sidebar, eliminating unused interior space without showing extra badge cards.

The Monthly Labs anchor follows this overview so its full-width content does
not break the two-column balance. At 821–1080px the insight cards use two
columns; below 820px tiers and profile content stack; below 600px cards stack
one per row. No score, slot, filter, share, or localization logic changed.

### Sticky Tiers during expanded badge browsing

On profile dashboards at widths >= 821px, the public Arcade 2026 Tiers
sidebar sticks just below the fixed header while the longer badge list scrolls.
The offset uses a ResizeObserver-measured `--arcade-sticky-header-height` (with `--arcade-anchor-offset` fallback) so longer navigation translations or tablet wrapping never overlap the sidebar.
The panel's height is bounded by the viewport and its own contents scroll
when they cannot fit (including history and Swag links); no data is hidden.
Mobile (<= 820px) and the Guest layout keep normal document scrolling.
Browser regression checks cover 64 expanded badges at mobile, tablet, and
desktop widths, including header clearance and panel scrolling.
