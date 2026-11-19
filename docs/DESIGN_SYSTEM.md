# AEGIS Design System — Canonical Enterprise UI Contract
**Version:** AEGIS DS 1.0 · 19 November 2026 · **status: implementation contract**

## Immutable upstream foundation

**Use [Tabler UI](https://tabler.io/) [@tabler/core 1.5.1](https://www.npmjs.com/package/@tabler/core/v/1.5.1), MIT-licensed.** Never replace the framework or invent an unrelated dashboard theme without an explicit design-system change. Genuine pinned Tabler compiled CSS is installed through npm and served same-origin at `/vendor/tabler.min.css` from `node_modules/@tabler/core/dist/css/tabler.min.css`, not loaded through a mutable CDN URL.

Use the original [Tabler Icons](https://github.com/tabler/tabler-icons), MIT-licensed; the canonical 24×24 glyphs used in this release are stored under `public/tabler-icons.svg` and sourced from their upstream SVG definitions. No emoji icons, no mismatched generic glyphs, no custom drawn shapes where a Tabler icon exists. Preserve upstream license and attribution.

The app remains the existing small HTML/JavaScript/Node native assurance service. Adoption **does not** require a React migration, a rewritten evaluator, data migrations or new access permissions.

## Visual identity (no arbitrary replacement)

**System:** restrained institutional product, documented structure and actual proof-driven work. **Brand:** AEGIS Decision Assurance, Noetfield Systems Inc. The dark presentation is deep graphite, **not purple/brown gradients**, with restrained champagne for primary interactions and actual status. Light uses porcelain/cloud, charcoal text, subtle gray dividers and deep bronze for selected actions.

| Token | Dark | Light |
| --- | --- | --- |
| `background` | `#0c0e12` | `#f5f6f7` |
| `rail` | `#101318` | `#ffffff` |
| `panel` | `#161a20` | `#ffffff` |
| `raised` | `#1c2128` | `#f8f9fa` |
| `divider` | `#303640` | `#dce1e6` |
| `text` | `#f3f4f4` | `#19212a` |
| `secondary` | `#b3bac3` | `#475569` |
| `accent` | `#d5b777` | `#9e7740` |
| `success` | `#76c7aa` | `#257b62` |
| `failure` | `#e89a98` | `#ac3f48` |

Theme controller: `public/theme.js`; storage key `aegis_color_mode_v1`; user selection **Dark / Light / System**. Follow system preference in System mode; all pages must respect the same preference. Set `data-bs-theme` and `data-aegis-theme` before CSS first paint. No theme-dependent changes to evidence measurements or stored case data.

## Three application surfaces, one system

1. **Public seven-view Command Center** `/` and `/tour`: preserves real native-derived metrics, policy impact, AI systems, evaluation, provenance and public synthetic JSON export. Theme bridge: `public/tour-system.css`.
2. **Private ISC Readiness login** `/login`: responsive Tabler-style split-auth layout, compact explanatory journey, accessible EN/FR password form, production-safe authenticated session. Theme bridge: `public/login-system.css`. No purple oversized half-page Hero, no controls overflowing a card.
3. **Private six-stage Assurance Workbench** `/workbench`: original authenticated system→policy→evaluation→review→report→E1–E6/benchmark flow retained. Canonical Tabler components `card`, `btn`, `form-control`, `form-select`, `navbar`, `page-wrapper`, and the fixed token layer `public/workbench-system.css`; mobile offcanvas sidebar and stage navigation. Engine stays unchanged.

## Rules for every new UI feature

- Use the framework's existing components and spacing scale before writing custom components. Keep all layout dimensions responsive: no fixed unresponsive width, no cards taller than the viewport and no horizontal page overflow at **320, 390, 768, 1024 and 1440** px.
- Mobile <= 900px: workbench uses a real offcanvas sidebar with menu, backdrop, Escape dismissal and `aria-expanded`. It must not occupy half the screen or push the main stage sideways. Keep native UI controls >= 40px (44px preferred).
- Text hierarchy: Inter regular/semibold, minimum 11px for essential metadata, 12–14px for descriptions, 21–27px stage headings, 29–39px Workbench heading. Avoid large static marketing H1 on operational screens.
- Use `textContent` for dynamic data; no untrusted HTML interpolation into graphs. Keep exact source receipts, input version and finding labels. Do not fabricate any compliance metrics, approval or TRL level.
- **English en-CA by default, French fr-CA alternate**; left-to-right; no Persian public/private web copy. Translation must not change submitted or original evidence.
- Use focus rings, explicit labels, screen-reader hints and reduced-motion styling. Tests in Chrome are implementation checks, not independent WCAG certification.
- Commercial confidence comes from traceable, functional workflows and high-fidelity interaction, not invented ratings or fictional enterprise tenants.

## Design-system drift gate

Before any future redesign, read this canonical contract and the Tabler source docs. Every new page must extend this stable system, not instantiate a fresh color palette, different typography, bespoke icons or another generic landing template.

**Required CI acceptance:** Tabler package actually installed; same-origin CSS 200; login EN/FR; native private Workbench still works; Dark/Light/System persistence; mobile drawer; no document-width overflow in light/dark; public route retains fixed read-only data; all tests succeed and real 1440/390 screenshots are inspectable. Add actual independent user and visual QA before claiming parity with leading enterprise AI governance products.

## Licensing and sources

- Tabler UI code and styles: https://github.com/tabler/tabler — MIT.
- Tabler Icons glyphs: https://github.com/tabler/tabler-icons — MIT.
- Relevant UI foundation docs: https://docs.tabler.io/ui/layout/page-layouts and https://tabler.io/guides/bootstrap-5-dark-mode-dashboard
- Former AEGIS Obsidian/Champagne is superseded by **AEGIS DS 1.0**, a Tabler-backed institutional Graphite/Porcelain system.

**Noetfield legal/product boundary:** AEGIS is a Noetfield product; this design system is not assigned to other independent founder ventures automatically.
