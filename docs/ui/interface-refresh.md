# Arcade component refactor

The established Arcade layout, typography, gradients, seasonal palette, panel sizes and content order are retained. The earlier visual redesign was withdrawn after review.

The PR now extracts ProfileAnalyzer, DashboardPanel, SectionTitle and MetricStat without introducing a new visual system. The analyzer keeps linked labels, busy/error semantics and locale-independent data anchors for Facilitator and fresh-score integrations. Header labels remain catalog-driven and Escape closes mobile navigation with focus restoration.

The mobile full-width fix from main remains. Slot history, profile sharing, game history, bonus controls, copy actions and scoring are unchanged. The invalid shared-profile workflow glob is corrected and regression coverage protects the stable input anchor.
