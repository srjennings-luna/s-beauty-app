# Ambient Sound System assets

Six gapless-loop ambient MP3s served from `/public/music/`. Used by
the W2 Ambient Sound System (per
`~/Documents/KALLOS Launch/CONTUERI-CC-Ambient-Sound-Brief.html`) and
historically by the Pray page's chant/ambient picker.

## File slate (updated June 7, 2026)

| Canonical filename | Display label | Tone | Source |
|---|---|---|---|
| `ambient-gregorian-chant.mp3` | Gregorian Chant | Sacred — male schola, Latin "Amo Te" | nickpanekaiassets via Pixabay |
| `ambient-plainchant.mp3` | Choral Chant | Sacred — Stabat Mater, choral | Generated via Suno (June 2026 swap; replaces poshpony/Pixabay original) |
| `ambient-light-piano.mp3` | Light Piano | Contemplative — Arvo Pärt, *Für Alina* (two-piano performance) | archive.org public domain recording (June 2026 swap; replaces music_for_videos/Pixabay original) |
| `ambient-lofi-piano.mp3` | Lofi Piano | Contemplative — roomy, intimate piano | harumachimusic via Pixabay |
| `ambient-gentle-rain.mp3` | Gentle Rain | Nature — soft steady rain | meditativetiger via Pixabay |
| `ambient-ocean-waves.mp3` | Ocean Waves | Nature — gentle waves | rmultimediaeu via Pixabay |

Four of the six are licensed Pixabay (free / no attribution required / commercial use OK). Light Piano sourced from a public-domain archive.org recording of Arvo Pärt's *Für Alina* (June 2026 editorial swap — better fits the contemplative register). Choral Chant generated via Suno (June 2026 editorial swap — Stabat Mater register).

The internal sound IDs in `lib/userData.ts` remain unchanged (`plainchant`, `light-piano`) so user preferences persist through the swap. Only the audio content + display label changed.

## Gapless loop processing

Each file was processed through a custom ffmpeg pipeline so it loops
seamlessly via HTML5 `<audio loop>`:

```
[first 3s] [middle, original audio] [last 3s]
                                 │
                                 ▼
output = [middle] + crossfade(last 3s, first 3s)
```

The crossfade segment IS the loop transition. End-of-iteration N
acoustically blends into start-of-iteration N+1 with no perceptible
gap or click. Output is ~3 seconds shorter than source as a result.
Also normalized to -18 LUFS so volume is consistent across the slate.

Pipeline script: `/tmp/make-loop.sh` (kept in tmp; re-create if you
need to re-process a track. See git log for the version that produced
this batch).

## Updating the slate

To re-process a single file:

```
/tmp/make-loop.sh \
  "path/to/source.mp3" \
  ~/Documents/kallos-app/public/music/ambient-<slot>.mp3
```

Default crossfade is 3s; pass a third arg to override (e.g. `5.0` for
musical content with longer phrases).
