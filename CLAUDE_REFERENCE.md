# Seeking Beauty App - Reference Document

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

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| EWTN Navy | `#002D62` | Primary brand, nav active states |
| Dark Teal | `#203545` | Main background |
| Darker Teal | `#1a2a36` | Navigation bar, headers |
| Gold/Amber | `#C19B5F` | Accent, CTA buttons, scripture refs |
| White | Various opacities | Text hierarchy (100%, 80%, 50%, 40%) |

### Map Marker Colors (by Location Type)

| Type | Color | Hex |
|------|-------|-----|
| Sacred Art | Blue | `#002D62` |
| Architecture | Purple | `#4C3759` |
| Workshop/Studio | Gold | `#C19B5F` |
| Cultural | Terracotta | `#93583E` |
| Landscape | Green | `#2D5A27` |

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

**Hidden on:** `/splash`, `/episodes/[id]/artwalk`

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
  /favorites/page.tsx          # Favorites
  /splash/page.tsx             # Onboarding

/components
  /ArtworkViewer.tsx           # Full-screen artwork display
  /GlobalMap.tsx               # Leaflet map with markers
  /ui/Navigation.tsx           # Bottom nav (3 tabs)

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

- **Size**: 1200-1600px on longest side
- **Format**: JPEG preferred
- **File size**: Under 500KB
- Sanity handles optimization/CDN delivery

---

## Git Workflow

- Push to `main` branch
- Vercel auto-deploys
- Always check for running `next dev` process before starting new one
- Kill existing: `lsof -ti:3000 | xargs kill -9`

---

## Last Updated
January 2025
