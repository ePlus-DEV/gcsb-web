## Change summary

Describe the change and affected routes/components.

## Design & theme checklist (required for visible UI changes)

- [ ] I followed [docs/ui/DESIGN_SYSTEM.md](../docs/ui/DESIGN_SYSTEM.md) and used semantic `--ds-*` tokens for new colors (no unexplained hardcoded HEX/RGB/HSL or raw Tailwind palette classes).
- [ ] Primary interactions use **violet**; cyan is secondary, green/amber/red communicate status, and tier/chart colors are categorical only.
- [ ] Light and dark mode were checked at desktop and mobile widths, including normal, hover, focus, selected and disabled states.
- [ ] Text and interactive components meet WCAG AA contrast targets, including breadcrumbs, buttons, badges, overlays and tooltips.
- [ ] The **locked Arcade Points logo is unchanged** in both themes and all viewports.
- [ ] All new/changed UI copy is translated across supported locales as required by `AGENTS.md`.
- [ ] I included screenshots or PR Preview links for the affected light and dark views, or marked the change as non-visual.
- [ ] I ran unit tests and the CI design color guard. If an exception is needed, the relevant source line contains `design-color-exception: reason` and the PR explains why.

### Light mode (desktop/mobile)

Screenshot/preview:

### Dark mode (desktop/mobile)

Screenshot/preview:

### Color exceptions or not applicable

Explain any approved literal colors, tier/chart-specific colors or why this change is non-visual.
