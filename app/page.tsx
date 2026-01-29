import Link from "next/link";
import { getReleasedEpisodes } from "@/data/episodes";
import EpisodeCard from "@/components/EpisodeCard";

export default function HomePage() {
  const releasedEpisodes = getReleasedEpisodes();
  const latestEpisode = releasedEpisodes[releasedEpisodes.length - 1];

  return (
    <div className="min-h-screen bg-catskill-white">
      {/* Hero Section */}
      <div className="relative h-[55vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg/1280px-St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/40 to-deep-navy/95" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-6 text-white safe-area-top">
          {/* Logo/Title area */}
          <div className="mb-6">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-2 font-medium">
              An EWTN+ Original Series
            </p>
            <h1 className="text-4xl font-bold mb-3 font-serif-elegant">
              Seeking Beauty
            </h1>
            <p className="text-white/90 text-lg">with David Henrie</p>
          </div>

          {/* Quote */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-4">
            <p className="font-serif-elegant-italic text-white/95 text-lg leading-relaxed">
              &ldquo;Beauty is the language of the divine and a reflection of God.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-5 -mt-2 relative">
        {/* CTA Card */}
        <div className="meditation-card p-6 mb-6">
          <h2
            className="text-xl font-bold text-deep-navy mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Your Companion for Contemplation
          </h2>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Go deeper into the art, locations, and spiritual themes from each
            episode. Explore interactive maps, zoom into masterpieces, and
            discover how beauty leads us closer to God.
          </p>

          <Link
            href="/episodes"
            className="mt-5 w-full btn-primary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                fillRule="evenodd"
                d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
                clipRule="evenodd"
              />
            </svg>
            Begin Season 1: Italy
          </Link>
        </div>

        {/* Latest Episode */}
        {latestEpisode && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-bold text-deep-navy uppercase tracking-wider"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Latest Episode
              </h3>
              <Link
                href="/episodes"
                className="text-sm text-ewtn-red font-medium"
              >
                See all
              </Link>
            </div>
            <EpisodeCard episode={latestEpisode} variant="featured" />
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link href="/episodes" className="meditation-card p-4 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-deep-navy/5 rounded-xl flex items-center justify-center group-hover:bg-deep-navy/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-deep-navy"
              >
                <path
                  fillRule="evenodd"
                  d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p
              className="text-xs font-semibold text-deep-navy"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Artwalk Maps
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Explore locations</p>
          </Link>

          <Link href="/map" className="meditation-card p-4 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-deep-navy/5 rounded-xl flex items-center justify-center group-hover:bg-deep-navy/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-deep-navy"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p
              className="text-xs font-semibold text-deep-navy"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Zoomable Art
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">See the details</p>
          </Link>

          <Link href="/favorites" className="meditation-card p-4 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-ewtn-red/5 rounded-xl flex items-center justify-center group-hover:bg-ewtn-red/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-ewtn-red"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <p
              className="text-xs font-semibold text-deep-navy"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Saved
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Your favorites</p>
          </Link>
        </div>

        {/* Daily Scripture */}
        <div className="meditation-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent-gold">
                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.462 7.462 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-deep-navy uppercase tracking-wider">
              Beauty as Divine Language
            </h3>
          </div>
          <p className="scripture-verse">
            &ldquo;He has made everything beautiful in its time.&rdquo;
          </p>
          <p className="scripture-reference mt-3">— Ecclesiastes 3:11</p>
        </div>

        {/* EWTN Link */}
        <div className="text-center pb-8">
          <p className="text-sm text-gray-500 mb-3">Watch the full series on</p>
          <a
            href="https://www.ewtn.com/tv/shows/seeking-beauty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-deep-navy text-white rounded-xl font-semibold text-sm shadow-lg hover:bg-deep-navy-light transition-colors"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" />
            </svg>
            Watch on EWTN+
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 ml-2"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
