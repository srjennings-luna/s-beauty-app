import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Enable CDN for faster reads
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}

// Fetch all episodes with their artworks
export async function getEpisodes() {
  return sanityClient.fetch(`
    *[_type == "episode"] | order(season asc, episodeNumber asc) {
      _id,
      title,
      shortTitle,
      season,
      episodeNumber,
      summary,
      locationLabel,
      "heroImageUrl": heroImage.asset->url,
      durationMinutes,
      airDate,
      ewtnPlusUrl,
      isReleased,
      featuredExperts,
      "artworks": artworks[]->{
        _id,
        title,
        artist,
        year,
        "imageUrl": image.asset->url,
        description,
        historicalSummary,
        scripturePairing,
        reflectionQuestions,
        locationName,
        city,
        country,
        coordinates,
        order
      } | order(order asc),
      reflections
    }
  `)
}

// Fetch a single episode by ID
export async function getEpisodeById(id: string) {
  return sanityClient.fetch(`
    *[_type == "episode" && _id == $id][0] {
      _id,
      title,
      shortTitle,
      season,
      episodeNumber,
      summary,
      locationLabel,
      "heroImageUrl": heroImage.asset->url,
      durationMinutes,
      airDate,
      ewtnPlusUrl,
      isReleased,
      featuredExperts,
      "artworks": artworks[]->{
        _id,
        title,
        artist,
        year,
        "imageUrl": image.asset->url,
        description,
        historicalSummary,
        scripturePairing,
        reflectionQuestions,
        locationName,
        city,
        country,
        coordinates,
        order
      } | order(order asc),
      reflections
    }
  `, { id })
}

// Fetch all artworks (for the map/gallery)
export async function getAllArtworks() {
  return sanityClient.fetch(`
    *[_type == "artwork"] | order(title asc) {
      _id,
      title,
      artist,
      year,
      "imageUrl": image.asset->url,
      description,
      historicalSummary,
      scripturePairing,
      reflectionQuestions,
      locationName,
      city,
      country,
      coordinates,
      order
    }
  `)
}

// Fetch released episodes only
export async function getReleasedEpisodes() {
  return sanityClient.fetch(`
    *[_type == "episode" && isReleased == true] | order(season asc, episodeNumber asc) {
      _id,
      title,
      shortTitle,
      season,
      episodeNumber,
      summary,
      locationLabel,
      "heroImageUrl": heroImage.asset->url,
      durationMinutes,
      airDate,
      ewtnPlusUrl,
      isReleased,
      featuredExperts,
      "artworks": artworks[]->{
        _id,
        title,
        artist,
        year,
        "imageUrl": image.asset->url,
        description,
        historicalSummary,
        scripturePairing,
        reflectionQuestions,
        locationName,
        city,
        country,
        coordinates,
        order
      } | order(order asc),
      reflections
    }
  `)
}

// Fetch coming soon episodes
export async function getComingSoonEpisodes() {
  return sanityClient.fetch(`
    *[_type == "episode" && isReleased == false] | order(season asc, episodeNumber asc) {
      _id,
      title,
      shortTitle,
      season,
      episodeNumber,
      summary,
      locationLabel,
      "heroImageUrl": heroImage.asset->url,
      airDate,
      isReleased
    }
  `)
}
