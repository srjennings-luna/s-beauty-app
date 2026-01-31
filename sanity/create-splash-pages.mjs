import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function createSplashPages() {
  // Splash Page 1 - Image with Quote
  const page1 = await client.create({
    _type: 'splashPage',
    pageNumber: 1,
    pageType: 'image-quote',
    quote: 'Beauty will save the world',
    quoteAttribution: 'Fyodor Dostoevsky',
  })
  console.log('Created Splash Page 1:', page1._id)

  // Splash Page 2 - Text Content
  const page2 = await client.create({
    _type: 'splashPage',
    pageNumber: 2,
    pageType: 'text-content',
    title: 'Your Companion for Contemplation',
    description: 'Seeking Beauty invites you on an unforgettable pilgrimage across Italy—where every landscape, masterpiece, and sacred space becomes a living encounter with the beauty of our Catholic faith.',
    buttonText: "Let's explore",
  })
  console.log('Created Splash Page 2:', page2._id)

  console.log('Done!')
}

createSplashPages()
