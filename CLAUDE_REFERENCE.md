# KALLOS — Design System Reference

This file is the source of truth for colors, typography, and UI rules. Read this before touching any visual code.

---

## Color Palette

Two distinct modes. Never mix them.

### Browse Mode (Today, Explore, Journeys, Library)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-parchment` | `#fdf6e8` | Page background |
| `--color-near-black` | `#1a1a1a` | Primary text |
| `--color-sage` | `#4a7a62` | Active nav, labels, section headers, progress bars |
| `--color-sage-muted` | `#7a9a8a` | Secondary text, metadata |
| `--color-blue-mist` | `#8aacb8` | Dates, music tags only |
| `--color-sacred-gold` | `#C19B5F` | ONE use per screen — quote border accent |

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

---

## Typography

| Font | Usage |
|------|-------|
| **Montserrat** | Headlines, UI labels, buttons |
| **Open Sans** | Body text, descriptions |
| **Cormorant Garamond** | Quotes, scripture, pull text — `.font-serif-elegant` |

---

## UI Rules (Non-Negotiable)

- **No rounded corners.** `border-radius: 0` everywhere. Sharp/square only.
- **No teal.** `#203545` is deprecated. Espresso for immersive, parchment for browse.
- **No gray text.** Use `sage-muted` or `cream-dim` instead.
- **Safe areas always.** Pad for iOS notch and home indicator on all immersive screens.
- **Images:** Min 1200px, aim for 4500px. 8x zoom via react-zoom-pan-pinch.

---

## Component Patterns

### Browse Cards (Today, Explore, Journeys)
- Background: parchment `#fdf6e8`
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
March 2026 — KALLOS Phase 1 complete. Espresso palette live.
