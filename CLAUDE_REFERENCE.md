# Seeking Beauty App - Reference Document

## User Context

**Sheri is a Product Manager with 20 years experience working with developers & stakeholders.**
- She's creative and experienced - understands product, UX, and how to work with dev teams
- She does not code - do the implementation, don't give code snippets to copy/paste
- Explain what you're doing so she can learn and make informed decisions
- Provide step-by-step guidance for manual tasks (like Sanity content entry)
- Test changes before pushing to make sure nothing breaks
- She can handle technical concepts - just don't expect her to write code

---

## Overview
Companion mobile web app for the EWTN+ documentary series "Seeking Beauty" with David Henrie. Allows viewers to explore sacred art, locations, and spiritual themes from each episode.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| React | React 19 |
| Styling | Tailwind CSS v4 |
| CMS | Sanity v3 (GROQ queries, not GraphQL) |
| Maps | React-Leaflet + react-leaflet-cluster |
| Deployment | Vercel (auto-deploy from GitHub) |
| Storage | localStorage (favorites, onboarding state) |

---

## URLs

- **Live App**: Deployed on Vercel (auto-deploys on push to main)
- **Sanity Studio**: https://seeking-beauty.sanity.studio
- **Sanity Project ID**: `em44j9m8`
- **GitHub Repo**: https://github.com/srjennings-luna/s-beauty-app

---

## Design System

### Color Palette (Sacred Art palette – sample_sacred_art_colors)

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | `#C19B5F` | Accent app-wide: CTAs, step labels, scripture refs, “Go deeper”, dots, Next link |
| Dark Teal | `#203545` | Main page background (middle of gradient) |
| Lighter Teal | `#2a4050` | Header / top of page (subtle vertical gradient) |
| Darker Teal | `#1a2a36` | Bottom nav bar, Go deeper bar (fixed), music menu, step nav area |
| Plum | `#4C3759` | Architecture markers on map |
| Rust | `#93583E` | Cultural markers |
| Maroon | `#66293C` | **Map icons/markers only** (e.g. sacred-art pin); not used for nav, headers, or Go deeper |
| White | Various opacities | Text hierarchy (100%, 80%, 50%, 40%) |

**Gradient:** Page uses a subtle vertical gradient: lighter teal at top → main teal → darker teal at bottom. Only the **Go deeper** bar has the darker background; pagination (dots + Next) uses the same background as the page.

### Map Marker Colors (by Location Type)

| Type | Color | Hex |
|------|-------|-----|
| Sacred Art | Maroon / Navy | `#66293C` or `#203545` |
| Architecture | Plum | `#4C3759` |
| Workshop/Studio | Gold | `#C19B5F` |
| Cultural | Rust | `#93583E` |
| Landscape | Green | `#2D5A27` (optional; or use Rust) |

### Typography

- **Montserrat** - Headlines, UI elements
- **Open Sans** - Body text
- **Cormorant Garamond** - Scripture/quotes (elegant serif)

### UI Style Rules

- **NO rounded corners** - Use square/sharp corners (classic, refined aesthetic)
- **Dark theme** throughout
- **Subtle transparency** (`bg-white/10`) for layered elements
- **Gold accents** for interactive elements and spiritual content
- **Safe area padding** for modern phones (notches, home indicators)

---

## Navigation

**Bottom nav with 3 tabs:**
1. **Home** (/) - Episodes list
2. **Artwalk** (/map) - Map and list view of all art
3. **Favorites** (/favorites) - Saved items

**Hidden on:** `/splash`, `/episodes/[id]/artwalk`, `/pray`

---

## Key Features

### Splash/Onboarding
- 3-screen intro sequence
- Gold animated "Let's explore" button with pulse animation
- Shows once per user (localStorage: `hasSeenOnboarding`)

### Episodes Hub (Home)
- Episode cards with hero images
- "Coming Soon" for unreleased episodes
- Tapping opens episode detail page

### Episode Detail
- Hero image with episode info
- Artwork gallery grid
- Tap artwork to open ArtworkViewer

### Artwalk (/map)
- Toggle between Map view and List view (button in header)
- Episode filter pills
- Clustered markers on map
- Colored markers by location type

### ArtworkViewer
- Full-screen overlay
- Pinch-to-zoom on image
- Shows Scripture (for Sacred Art/Architecture) OR Quote (for other types)
- Historical context, reflection questions
- Favorite button

### Favorites
- Saved to localStorage
- Persists across sessions

### Pray / Visio Divina (`/pray/[artworkId]`)
- **Entry:** “Pray with this image” from ArtworkViewer or episode detail
- **Steps:** Gaze → Meditate → Pray → Contemplate → Action
- **Navigation:** Swipe left/right to change steps; pagination dots (centered) + “Next” on the right, placed under the step content; same background as page (no darker bar). Arrow keys work on desktop.
- **Image:** Full image visible (no crop), pinch-to-zoom and pan (same as ArtworkViewer) on Gaze, Meditate, and Contemplate. Double-tap toggles zoom.
- **Reflection questions (Meditate step):** Collapsed by default with “Reflection questions (2)” and chevron; tap to expand/collapse; max 2 questions shown.
- **Go deeper:** Fixed at bottom of viewport (position does not move between steps). Darker teal bar; expandable tradition reflections (Church Fathers, Saints, Popes).
- **Music:** Header “Music” link opens menu near the link (top-right). Options: Off, Chant, Ambient. When Chant or Ambient is on, a floating speaker button appears (bottom-right). Audio files: `public/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3` (Chant), `public/music/natureseye-piano-dreamcloud-meditation-179215.mp3` (Ambient). See `public/music/README.md`. If files are missing, selection still updates (floating icon on desktop) but playback may fail.

---

## Location Types

| Type | Shows | Use For |
|------|-------|---------|
| Sacred Art | Scripture | Paintings, sculptures, religious art |
| Architecture | Scripture | Churches, basilicas, buildings |
| Workshop/Studio | Quote | Art schools, ateliers |
| Cultural | Quote | Restaurants, cultural sites |
| Landscape | Quote | Natural locations, vistas |

**Logic:**
- `isSacredArt = !locationType || locationType === 'sacred-art' || locationType === 'architecture'`
- Sacred Art types show Scripture field
- Other types show Quote field

---

## File Structure (Key Files)

```
/app
  /page.tsx                    # Home (Episodes list)
  /map/page.tsx                # Artwalk (map + list)
  /episodes/[id]/page.tsx      # Episode detail
  /episodes/[id]/artwalk/      # Episode-specific artwalk
  /pray/[artworkId]/page.tsx   # Visio Divina (Gaze → Action, swipe + dots, zoomable image)
  /favorites/page.tsx          # Favorites
  /splash/page.tsx             # Onboarding

/components
  /ArtworkViewer.tsx           # Full-screen artwork display (pinch-zoom)
  /GoDeeperSection.tsx         # Tradition reflections (used on Pray page)
  /GlobalMap.tsx               # Leaflet map with markers
  /ui/Navigation.tsx           # Bottom nav (3 tabs; hidden on /pray, /splash, artwalk)

/lib
  /sanity.ts                   # Sanity client + GROQ queries
  /types.ts                    # TypeScript types

/sanity
  /schemaTypes/
    /episode.ts                # Episode schema
    /artwork.ts                # Artwork schema (has locationType)
```

---

## Sanity Schema Notes

### Episode
- title, shortTitle, summary
- heroImage (Sanity image)
- season, episodeNumber
- isReleased (boolean)
- artworks (array of references)

### Artwork
- title, artist, year, description
- image (Sanity image)
- locationName, city, country
- coordinates (lat, lng) - **manually entered**
- locationType (radio: sacred-art, architecture, workshop, cultural, landscape)
- scripturePairing (verse, reference) - for Sacred Art/Architecture
- quote (text, attribution) - for Workshop/Cultural/Landscape
- reflectionQuestions (array of strings)
- episode (reference)
- order (number)

**Conditional visibility in Sanity Studio:**
- Scripture hidden for workshop, cultural, landscape
- Quote hidden for sacred-art, architecture
- Artist hidden for non-art types

---

## Common Mistakes to Avoid

1. **Don't add rounded corners** - Design uses sharp/square corners
2. **Don't rename Home to Episodes** - Nav tab is "Home"
3. **Don't add extra nav tabs** - Only 3: Home, Artwalk, Favorites
4. **Don't use GraphQL** - App uses GROQ queries
5. **Don't enable Sanity CDN** - Keep `useCdn: false` for fresh data
6. **GPS coordinates are manual** - User enters lat/lng in Sanity

---

## Image Specs (for Sanity uploads)

- **Size**: 1200-1600px minimum, up to 4500px for detail-rich images (ceilings, frescoes)
- **Format**: JPEG preferred
- **File size**: Under 500KB for standard, larger OK for high-detail images
- Sanity handles optimization/CDN delivery
- **Zoom levels**: minScale=1 (no zoom out), maxScale=8 (8x zoom in)

---

## Git Workflow

- Push to `main` branch
- Vercel auto-deploys
- Always check for running `next dev` process before starting new one
- Kill existing: `lsof -ti:3000 | xargs kill -9`

---

## How to Verify This Doc is Accurate

Run these commands to check current state:

```bash
# Check nav tabs (should say "Home", "Artwalk", "Favorites")
grep -A 2 'label:' components/ui/Navigation.tsx

# Check location types are in schema
grep 'locationType' sanity/schemaTypes/artwork.ts

# Check recent commits (what's actually deployed)
git log --oneline -10

# Check marker colors exist in code
grep -A 5 'locationTypeColors' components/GlobalMap.tsx

# Verify colored markers are deployed (look for commit with "colored map markers")
git log --oneline --grep="marker"
```

**To see colored markers in the live app:**
1. Go to https://seeking-beauty.sanity.studio
2. Edit an artwork → set Location Type to something other than "Sacred Art"
3. Save and publish
4. Go to Artwalk in the app → marker should show the new color

If anything doesn't match this doc, the doc needs updating.

---

## Session Notes

**Jan 31, 2025 (evening):**
- Fixed Home tab (was showing "Episodes")
- Deployed Sanity schema with Location Types (had styled-components error, fixed by reinstalling node_modules)
- Location Type field now visible in Sanity Studio at top of Artwork form
- Created this reference doc
- Colored markers code is deployed, just need to set locationType in Sanity to see different colors

**Jan 31, 2025 (later):**
- Added Splash Pages to Sanity CMS
- Created splashPage schema with two page types: "Image with Quote" and "Text Content"
- Added full styling controls (colors, fonts, sizes) in a separate "Styling" tab
- Splash page content: Page 1 (quote + image), Page 2 (title + description + button)
- App falls back to default content if Sanity has no splash pages
- Fixed splash page 1 bottom padding (quote was getting cut off by home indicator)
- Added YouTube video embedding to Episodes
  - New `youtubeUrl` field in Episode schema
  - Embedded player appears on episode detail page above Sacred Art section
  - Supports youtu.be and youtube.com URL formats
- Fixed zoom interaction in ArtworkViewer - minScale now 1 (can't zoom out smaller than original)
- Increased maxScale to 8x for high-res images (supports 4500px+ images like St. Peter's dome)

**Sanity content types now:**
1. Episode (with YouTube URL field)
2. Artwork / Location (with Location Types)
3. Splash Page (with Styling tab)

**Coordinate format for Sanity:**
- Use decimal format (e.g., 41.893, 12.471)
- NOT degrees/minutes/seconds
- Tip: Right-click on Google Maps to copy decimal coordinates

**Start of next session:**
1. Read this file first: `CLAUDE_REFERENCE.md`
2. Run verify commands to confirm state
3. Ask what to work on

---

## Last Updated
February 2025

**Recent (Feb 2025):** Pray page: teal gradient (no maroon except map icons); gold #C19B5F app-wide; swipe + centered dots + Next on right; zoomable image (Gaze/Meditate/Contemplate); reflection questions collapsed by default with chevron expand/collapse (max 2); Go deeper bar fixed at bottom; music menu near header; pagination under step content, same bg as page. Deployment steps in `DEPLOYMENT.md`.
