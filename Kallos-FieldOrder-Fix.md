# Claude Code Task: Fix contentItem Field Ordering in Sanity Studio

## Problem
The current field order in `sanity/schemaTypes/contentItem.ts` does not match a logical content entry workflow. Fields appear in this order in Studio:

1. Content Type ✓
2. Title ✓
3. **Image** ← too early; editors want to fill text fields before uploading
4. Brief Description
5. Context
6. **Themes** ← should be earlier (right after Title)
7. Reflection Questions
8. Curator Note
9. Location group
10. **Type-specific fields (Artist, Year, etc.)** ← too late; these should follow Content Type selection immediately

This makes Sanity Studio harder to use. Sheri has to scroll past the image upload to reach the description, and the Artist/Thinker/Author/Composer fields are buried at the very bottom below the Location group.

## Goal
Reorder the fields in the `fields: [...]` array in `contentItem.ts` so they appear in logical data-entry order in Sanity Studio.

**New field order:**

1. `contentType` (required — determines all conditional fields)
2. `title` (required)
3. **Type-specific identity fields** (who created/who is this):
   - `artist` (hidden unless sacred-art)
   - `thinkerName` (hidden unless thinker)
   - `author` (hidden unless literature)
   - `composer` (hidden unless music)
4. `themes` (tag early)
5. `description` (short — fill before uploading image)
6. `context` (longer — fill before uploading image)
7. `image` (required — upload after text fields are done)
8. **Type-specific detail/metadata fields**:
   - Sacred Art: `year`, `medium`, `scripturePairing`
   - Thinker: `quote`, `era`, `tradition`
   - Literature: `workTitle`, `literaryForm`, `excerpt`
   - Music: `performer`, `durationMinutes`, `musicUrl`, `audioFile`
   - Food & Wine: `craftTradition`, `pointsToward`
   - Landscape: `creationTheology`
   - Watch & Listen: `mediaType`, `mediaUrl`, `durationMinutes`, `series`
9. `reflectionQuestions`
10. `curatorNote`
11. Location group: `locationName`, `city`, `country`, `coordinates`
12. Legacy fields (remain hidden): `locationType`, `historicalSummary`, `order`

## Implementation Notes

- **Only reorder fields within the `fields: [...]` array** — do not change any field definitions, validation rules, hidden conditions, or group assignments
- The `location` group is defined in the `groups: [...]` array — leave that unchanged
- All `hidden: ({document}) => ...` conditions stay exactly as-is
- After reordering, run `npm run build` to confirm no TypeScript errors
- Then run `npx sanity deploy` from the `/sanity` folder to push the updated schema to Sanity Studio

## Verification
After deploying, open Sanity Studio → Content Item → Create new. Confirm the field order is:
- Content Type (radio buttons) → Title → [Artist/Thinker/etc. appears if relevant type selected] → Themes → Brief Description → Context → Image → [type-specific detail fields] → Reflection Questions → Curator Note → Location tab

## Files to Change
- `sanity/schemaTypes/contentItem.ts` — reorder `fields: [...]` array only

## Steps
1. Edit `sanity/schemaTypes/contentItem.ts`
2. Run `npm run build`
3. Run `npx sanity deploy` (from the `/sanity` subdirectory — or `cd sanity && npx sanity deploy`)
4. Confirm deploy succeeds
5. Commit: `git add sanity/schemaTypes/contentItem.ts && git commit -m "Reorder contentItem fields for logical Sanity data entry flow"`
6. Push to main
