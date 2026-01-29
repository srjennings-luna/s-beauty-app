import { getReleasedEpisodes, getComingSoonEpisodes } from "@/data/episodes";
import EpisodeCard from "@/components/EpisodeCard";

export default function EpisodesPage() {
  const releasedEpisodes = getReleasedEpisodes();
  const comingSoonEpisodes = getComingSoonEpisodes();

  return (
    <div className="min-h-screen bg-catskill-white">
      {/* Header */}
      <div className="bg-deep-navy text-white p-6 pb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Season 1: Italy
        </h1>
        <p className="text-white/80">
          {releasedEpisodes.length} episodes available
        </p>
      </div>

      {/* Episode List */}
      <div className="p-4 -mt-4">
        <div className="space-y-4">
          {/* Released Episodes */}
          {releasedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}

          {/* Coming Soon Section */}
          {comingSoonEpisodes.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h2
                  className="text-lg font-semibold text-deep-navy"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Coming Soon
                </h2>
                <p className="text-sm text-gray-500">
                  New episodes releasing soon
                </p>
              </div>
              {comingSoonEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
