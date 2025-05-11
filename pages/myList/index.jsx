import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import AnimeEditModal from '@/components/AnimeEditModal';
import MyListItem from '@/components/MyListItem'; 

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
              {status === 'all'
                ? 'All'
                : status[0].toUpperCase() + status.slice(1).replace(/-/g, ' ')}
            </button>
          ))}
        </div>

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
            {filteredList.map((anime) => (
              <MyListItem key={anime.id} anime={anime} onClick={() => setModalAnime(anime)} />
            ))}
          </div>
        )}
      </div>

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
