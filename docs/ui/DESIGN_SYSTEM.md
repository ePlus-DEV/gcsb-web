# Arcade Points — Color & Theme Rules

> **Canonical design specification** for website UI. Applies to humans, AI agents, scheduled jobs, CSS, Tailwind utilities and new React components. Refer to [AGENTS.md](../../AGENTS.md) and the PR checklist. These are **design decisions**, not a claim that all legacy CSS has already been migrated.

## Identity and hierarchy

1. **Violet is the single interactive primary**: main CTA, selected nav/tab, selected filter, active input and focus accents. Avoid competing cyan/blue/green main buttons.
2. **Teal/cyan is secondary**: informational links, live data and supporting annotations; it must not compete with the primary CTA.
3. **Gold belongs to existing Arcade Points logo and named tiers**. The current logo's pixels, colors and layout are locked by AGENTS.md; this rule **does not authorize any logo alteration**.
4. **Green / amber / rose are semantic status only**: success/completed/positive, warning/pending, error/negative. Never communicate state by color alone; include label/icon/text.
5. **Tier colors and charts are categorical** and may use multiple colors when needed to distinguish tiers/data, with accessible text and legend. They do not redefine the site's primary UI color.
6. Use neutral backgrounds/text/borders. Limit one strong CTA per interaction group. Secondary button = neutral outline or subtle; tertiary = text button.

## Official tokens

The implementation is at `app/styles/design-tokens.css`. New UI should use `var(--ds-...)` rather than new HEX/RGB/HSL or raw `text-purple-*`, `bg-cyan-*`, etc. The older `--arcade-*` tokens remain operational during migration; do **not** remove them without a separate, tested migration.

| Purpose | Semantic token | Light | Dark |
| --- | --- | --- | --- |
| Primary action | `--ds-primary` | `#6D28D9` | `#6D28D9` |
| Primary hover | `--ds-primary-hover` | `#5B21B6` | `#5B21B6` |
| On primary | `--ds-on-primary` | `#FFFFFF` | `#FFFFFF` |
| Supporting links | `--ds-link` | `#0E7490` | `#67E8F9` |
| Page background | `--ds-bg` | `#F4F7FF` | `#050918` |
| Card surface | `--ds-surface` | `#FFFFFF` | `#0A1328` |
| Soft surface | `--ds-surface-subtle` | `#EEF2FF` | `#0D1931` |
| Main text | `--ds-text` | `#172033` | `#F7F9FF` |
| Muted text | `--ds-text-muted` | `#475569` | `#94A3B8` |
| Border | `--ds-border` | `#DBE3F2` | `#273657` |
| Success | `--ds-success` | `#15803D` | `#43DC8B` |
| Warning | `--ds-warning` | `#B45309` | `#FBBF24` |
| Danger | `--ds-danger` | `#BE123C` | `#FB7185` |
| Focus ring | `--ds-focus` | `#6D28D9` | `#A78BFA` |
| Logo / special tier gold (reference only) | `--ds-brand-gold` | `#FFD43B` | `#FFD43B` |

**Buttons:** `background: var(--ds-primary); color: var(--ds-on-primary)`; hover = `var(--ds-primary-hover)`. For secondary buttons use surface/text/border. A light cyan background with black text is **not** the standard primary action even if contrast passes.

## Theme rules

- Theme class belongs to `html.light` / `html.dark` (managed by next-themes). Define both states for new light/dark surfaces; use global tokens unless a component has a justified local semantic token.
- Always verify text, icon, border, button, hover/active, disabled, placeholder, breadcrumb, badge, dialog/drawer, link and focus colors in **both** modes.
- WCAG AA contrast target: **4.5:1** normal text, **3:1** large text, significant icons/focus boundaries and interactive component indicators. Gradient text must pass against the lightest underlying region.
- Avoid broad rules that override interactive descendants such as `.internal-prose a`; scope prose styles and honor `.not-prose`.
- Do not use a bright background with bright text, or pale text on pale cards. Prefer opaque neutral surfaces for readability.
- Review 390px and 1280px viewports at a minimum, including sidebar, Swag Drops, Facilitator, Cookie notice and any changed route.

## Allowed exceptions

- Official logo artwork: **never modify automatically**.
- Tier ranks, chart series, badge artwork, third-party product imagery, seasonal illustrations and externally defined brand colors may legitimately use their own colors.
- Keep data/status semantics distinct from CTA colors.
- Rare hardcoded literal required by a specification may be annotated **on the same changed source line** with `design-color-exception: <reason>` and must be explained in the PR. This is an escape hatch for review, not a default coding style.
- Existing hardcoded colors are **legacy debt**, not a license to add new ones. A separate visual migration may remove them; keep current UI unchanged in governance-only PRs.

## Examples

```css
/* Preferred: automatically adapts across themes */
.primary-action {
  background: var(--ds-primary);
  color: var(--ds-on-primary);
}
.primary-action:hover { background: var(--ds-primary-hover); }
.breadcrumb { color: var(--ds-text-muted); }
.breadcrumb[aria-current="page"] { color: var(--ds-text); }

/* Avoid: a new, unrelated one-off CTA color */
.new-action { background: #22d3ee; color: #07111f; }
```

## Required PR workflow

1. Use token names and choose the **semantic role** before choosing a hue.
2. Add both light/dark behavior. Check normal, hover, focus, disabled and selected states.
3. Attach light and dark screenshots (desktop/mobile) for visible UI changes; verify no unintended changes to the locked Arcade logo.
4. Update all locale catalogs if visible copy changes (see AGENTS.md).
5. Run `node scripts/design-color-guard.mjs --base origin/main` after fetching main, `yarn test:unit`, and relevant browser/CI checks.
6. CI rejects newly introduced raw hex/RGB/HSL colors in UI source unless the exact new line includes a documented exception. Legacy unchanged colors are not blocked. The guard also flags new raw Tailwind palette classes so reviewers can request semantic classes/tokens.
7. If a new reusable token is needed, add it to `design-tokens.css`, document its purpose here and review its contrast. **Do not introduce a new primary hue** without an explicit design-system decision.

## Adoption progress (phase 1)

The rollout is in `app/styles/design-adoption.css`, imported **after** legacy page-level styles. These are real runtime overrides, not merely design examples:

- Violet primary: Analyze, cookie acknowledgement, Facilitator actions and Swag Drops main actions, including hover and accessible text.
- Neutral secondary: cookie details, Swag outline/chip actions, and Earned Badges “Load more”.
- Violet selected/focus: header active navigation, badge filters, mobile navigation and input focus rings.
- Secondary teal/cyan: informational breadcrumbs, supporting text links and Swag source links.
- Category and semantic exceptions: tier rank colors, chart legends, earned badge art, provider imagery, completion/success/warning/danger state colors.

This is **not** a whole-site migration of legacy colors. Existing route-specific CSS may still include older hardcoded values. Subsequent PRs should progressively replace those literals with semantic tokens, use browser contrast checks, and avoid changing the locked logo. Run `node scripts/verify-semantic-ui.mjs` after building the static site for smoke verification.
