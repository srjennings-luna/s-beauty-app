# KALLOS — Design System Reference

This file is the source of truth for colors, typography, and UI rules. Read this before touching any visual code.

---

## Color Palette

Two distinct modes. Never mix them.

### Browse Mode (Today, Explore, Journeys, Library)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-parchment` | `#fdf6e9` | Page background |
| `--color-near-black` | `#1a1a1a` | Primary text |
| `--color-sage` | `#4a7a62` | Active nav, labels, section headers, progress bars |
| `--color-sage-muted` | `#7a9a8a` | Secondary text, metadata |
| `--color-blue-mist` | `#8aacb8` | Dates, music tags only |
| `--color-sacred-gold` | `#C19B5F` | ONE use per screen — quote border accent |
| `--color-editorial-muted` | `#978b7d` | Italic question text in Explore detail Zone 2 header |
| `--color-warm-dark` | `#3d3530` | Excerpt text on editorial cards (Cormorant italic body) |

### Immersive Mode (Journey steps, Visio Divina)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-espresso` | `#16110d` | Page background |
| `--color-cream` | `rgba(253,246,232,0.88)` | Primary text |
| `--color-cream-dim` | `rgba(253,246,232,0.5)` | Secondary text |
| `--color-cream-faint` | `rgba(253,246,232,0.25)` | Labels, metadata |
| `--color-divider` | `rgba(253,246,232,0.1)` | Borders, dividers |
| `--color-dark-box` | `#24201d` | Quote blocks, inset cards |
| `--color-sage` | `#4a7a62` | Active steps, Continue button background |
| `--color-sacred-gold` | `#C19B5F` | ONE use per screen — quote border only |

**Gold rule:** `#C19B5F` is used sparingly — one intentional moment per screen. Not for CTAs, not for nav. The Continue button uses sage `#4a7a62`, not gold.

**Chrome on parchment rule (May 29, 2026):** Nav bars and editorial header chrome on browse/parchment screens use espresso `#16110d`, not gray and not sage. This applies to the Zone 1 nav (back chevron, CONTUERI wordmark, map button) and any UI chrome sitting on parchment. The "no gray text" rule applies to content text; espresso chrome is the correct choice for structural UI elements.

---

## Typography

| Font | Usage |
|------|-------|
| **Montserrat** | Headlines, UI labels, buttons |
| **Open Sans** | Body text, descriptions |
| **Cormorant Garamond** | Quotes, scripture, pull text — `.font-serif-elegant`. Also: excerpt/body text on editorial cards (size 24px title + 13px italic excerpt). P&P editorial title at ~3.125rem (50px) Cormorant italic weight 500. Never below 1.3rem for standalone quotes. |

### Multi-line title wrap rule (June 2, 2026)

When a long title wraps to multiple lines (P&P editorial title, journey card title, content item title in Cormorant), **wrap flush-left, not staggered.** Cormorant italic carries its own rightward visual lean, so a flush-left wrap already cascades visually; an explicit indent on line 2 doubles down on the lean and reads as "try-hard" typography rather than confidence. Flush-left is also format-consistent: single-line titles, two-line titles, and three-line titles all behave identically, which matters across a week of daily viewing.

If a particular title wraps awkwardly at the natural break point (e.g. a parenthetical splits across lines), treat it as a one-off: live with it, or hand-tune the title text in Sanity. Do not introduce a manual `<br>` break field, a stagger toggle, or per-piece typography logic on the basis of one title. Revisit only if awkward wrapping becomes a recurring pattern across many titles.

---

## UI Rules (Non-Negotiable)

- **No rounded corners.** `border-radius: 0` everywhere. Sharp/square only.
- **No teal.** `#203545` is deprecated. Espresso for immersive, parchment for browse.
- **No gray text** (content). Use `sage-muted` (`#7a9a8a`) or `cream-dim` for content text. This rule governs readable content — not UI chrome. Nav bars, wordmarks, back chevrons, and structural UI elements on parchment use espresso `#16110d`. See "Chrome on parchment rule" above.
- **Safe areas always.** Pad for iOS notch and home indicator on all immersive screens.
- **Images:** Min 1200px, aim for 4500px. 8x zoom via react-zoom-pan-pinch.
- **Hairline borders:** `rgba(22,17,13,0.18)` for Zone 1 nav / `rgba(22,17,13,0.22)` for Zone 2 editorial header. Never use a fixed gray border on parchment screens.

---

## Component Patterns

### Browse Cards (Today, Explore, Journeys)
- Background: parchment `#fdf6e9`
- Card borders: `border-black/8` (very subtle)
- Image overlay gradient: `from-black/70 via-transparent`
- Title on image: white
- Section labels: sage `#4a7a62`, uppercase, tracked

### Immersive Steps (Journey, Visio Divina)
- Background: espresso `#16110d`
- Text: cream `rgba(253,246,232,0.88)`
- Progress indicator: sage squares in footer, above Continue button
- Continue button: sage `#4a7a62`, full width, white text
- Quote blocks: `#24201d` background, gold left border `2px`
- Dividers: `rgba(253,246,232,0.1)`

### Progress Indicator (Journey steps + Visio Divina)
- Square dots in footer, above Continue button
- Active step: sage, wider (20px wide × 5px tall)
- Inactive steps: white 20% opacity (5×5px squares)
- Transition: width 300ms ease

### Two-Zone Header Pattern (Explore detail screen — May 29, 2026)

Structural separation between navigation chrome and editorial content. Never merge these zones or put editorial content in Zone 1.

**Zone 1 — Navigation chrome (46px slim nav):**
- Espresso `#16110d` back chevron (left), CONTUERI wordmark centered, map button (right)
- Bottom hairline: `rgba(22,17,13,0.18)`
- No page title in Zone 1 — wordmark is the consistent identifier

**Zone 2 — Editorial header (the theme/content identity):**
- Uppercase accent-colored title: Montserrat 600, 26px, `letter-spacing: 0.14em`, `text-transform: uppercase`, color = theme accent
- No decorative rule below title
- Italic question: Open Sans italic 14px, `#978b7d` (`--color-editorial-muted`), `margin-top: 20px`
- Bottom hairline: `rgba(22,17,13,0.22)`

### Per-Screen Accent Cascade (May 29, 2026)

Each Explore theme screen drives one accent color through all surfaces: Zone 2 title, type labels, fills. Color comes from the theme's `color` field in Sanity (Variant fresco palette). This is a parallel system to P&P gradients — same principle, different screen. Never substitute P&P type colors here.

### Editorial Card Pattern (Explore theme detail — May 29, 2026)

Content cards on theme detail screens:
- 1:1 square image, no rounding
- Montserrat 8px 600 uppercase content-type label (accent color)
- Cormorant Garamond 24px weight 400 title
- Sage attribution text
- Cormorant Garamond italic 13px `#3d3530` (`--color-warm-dark`) excerpt, 3-line clamp
- No prop-rule between title and excerpt
- Cards flush edge-to-edge, no outer padding

---

## Variant Fresco Palette (Explore theme accent colors — May 29, 2026)

These are the per-theme accent colors used on Explore bubble landing and theme detail screens. Each theme has one locked color. Do not substitute P&P gradient colors.

| Theme | Color Name | Hex |
|-------|------------|-----|
| Light | Old Ochre | `#c9a07c` |
| Silence | Fresco Plum | `#9a8a9e` |
| Suffering & Beauty | Roman Wine | `#8b4557` |
| Creation | Verdigris | `#83a9a2` |
| Home / The Restless Heart | Clay Terra | `#c68a77` |
| Beauty Truth & Goodness | Sage Stone | `#a8ae9a` |

These values live in the Sanity `theme.color` field. The app reads them and applies as CSS inline styles.

---

## Navigation (4 Tabs)

| Tab | Route | Mode |
|-----|-------|------|
| Today | `/` | Browse (parchment) |
| Explore | `/explore` | Browse (parchment) |
| Journeys | `/journeys` | Browse (parchment) |
| Library | `/library` | Browse (parchment) |

Hidden on: `/pray/*`, `/journeys/[slug]/day/*`, `/splash`

---

## Sanity

- **Project ID:** `em44j9m8`
- **Studio URL:** `seeking-beauty.sanity.studio` (to rename: kallos.sanity.studio)
- **Queries:** GROQ only
- **Image builder:** `urlFor()` from `@sanity/image-url`
- **CLI:** Always run from `sanity/` subfolder, not root

---

## Deprecated (Do Not Use)

| Old | Replaced by |
|-----|-------------|
| `#203545` (dark teal) | `#16110d` (espresso) for immersive |
| `#C9A227` (old gold) | `#C19B5F` (sacred gold) |
| Gray text colors | `sage-muted` or `cream-dim` |
| Rounded corners anywhere | Sharp corners only |
| `CLAUDE_REFERENCE.md` pre-March 2026 content | This file |

---

## Last Updated
May 29, 2026 — Explore + Library build complete. Variant fresco palette locked. Two-zone header pattern, per-screen accent cascade, and editorial card pattern documented. New tokens `--color-editorial-muted` and `--color-warm-dark` added. Parchment hex corrected to `#fdf6e9`. Chrome on parchment rule and hairline border values established.
