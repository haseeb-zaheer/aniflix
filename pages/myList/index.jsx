import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import AnimeEditModal from '@/components/AnimeEditModal';

const statusLabels = {
  watching: 'Watching',
  completed: 'Completed',
  'plan-to-watch': 'Plan to Watch',
  'on-hold': 'On Hold',
  dropped: 'Dropped',
};

const statusColors = {
  watching: 'netflix-red text-white',
  completed: 'bg-green-600 text-white',
  'plan-to-watch': 'bg-gray-600 text-gray-300',
  'on-hold': 'bg-yellow-500 text-white',
  dropped: 'bg-red-700 text-white',
};

export default function MyList() {
  const { data: session } = useSession();
  const [animeList, setAnimeList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [modalAnime, setModalAnime] = useState(null);

  const fetchWatchlist = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/watchlist');
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      const data = await res.json();

      const formatted = data.map((anime) => ({
        id: anime.animeId,
        title: anime.animeTitle,
        episodes: Number(anime.totalEpisodes),
        watched: Number(anime.episodesWatched),
        rating: anime.userScore,
        image: anime.imageUrl,
        status: anime.status,
      }));

      setAnimeList(formatted);
    } catch (err) {
      console.error('Error loading watchlist:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [session]);

  const filteredList =
    selectedStatus === 'all'
      ? animeList
      : animeList.filter((anime) => anime.status === selectedStatus);

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />

      <div className="container mx-auto px-8 pt-24">
        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8 border-b border-netflix-gray pb-4 flex-wrap">
          {['all', 'watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-6 py-3 rounded-t-lg ${
                selectedStatus === status
                  ? 'netflix-red text-white'
                  : 'netflix-gray text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status]}
            </button>
          ))}
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <svg className="animate-spin h-8 w-8 text-red-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-gray-400 ml-4 text-lg">Loading your watchlist...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No anime in this list yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredList.map((anime) => {
              const percent =
                anime.episodes > 0
                  ? Math.min(100, Math.max(0, (anime.watched / anime.episodes) * 100))
                  : 0;

              return (
                <div
                  key={anime.id}
                  className="netflix-gray p-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => setModalAnime(anime)} // Show modal immediately
                >
                  <div className="flex items-start gap-6">
                    <img
                      src={anime.image}
                      className="w-32 h-48 object-cover rounded-lg"
                      alt={anime.title}
                    />

                    <div className="flex-1">
                      <h3 className="text-white text-2xl font-bold mb-2">{anime.title}</h3>

                      {anime.status !== 'plan-to-watch' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-gray-300 mb-2">
                            <span>
                              Episodes: {anime.watched}/{anime.episodes}
                            </span>
                            <span>{percent.toFixed(0)}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2.5">
                            <div
                              className="netflix-red h-2.5 rounded-full transition-all duration-300 text-transparent"
                              style={{ width: `${percent}%`, minWidth: '2px' }}
                            >
                              &nbsp;
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <span className="text-gray-300">Your Rating:</span>
                        <div className="flex items-center gap-1">
                          {anime.rating ? (
                            [...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.round(anime.rating / 2)
                                    ? 'text-yellow-400'
                                    : 'text-gray-600'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))
                          ) : (
                            <span className="text-gray-400">Not rated yet</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${statusColors[anime.status]}`}
                        >
                          {statusLabels[anime.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal opens immediately */}
      {modalAnime && (
        <AnimeEditModal
          anime={modalAnime}
          onClose={() => setModalAnime(null)}
          onSave={() => {
            setModalAnime(null);
            fetchWatchlist();
          }}
        />
      )}
    </div>
  );
}
