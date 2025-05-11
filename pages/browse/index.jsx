import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';

const genres = [
  'All', 'Action', 'Adventure', 'Comedy', 'Drama',
  'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi'
];

export default function Browse() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [modalAnime, setModalAnime] = useState(null);

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      setIsLoading(true);
      try {
        const url = `/api/anime/trending?page=${page}&genre=${encodeURIComponent(selectedGenre)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch anime');

        const data = await response.json();

        const transformedData = data.map(anime => ({
          id: anime.id,
          title: anime.title.romaji,
          genre: anime.genres || ['Unknown'],
          rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A',
          episodes: anime.episodes ?? 'N/A',
          image: anime.coverImage?.large || '/placeholder.jpg'
        }));

        setAnimeList(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setAnimeList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingAnime();
  }, [page, selectedGenre]);

  const filteredAnime = animeList.filter(anime =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 flex gap-8">
        <aside className="w-full md:w-1/4">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Filter anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-md netflix-gray text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>

          <div className="mb-12">
            <h2 className="text-white text-xl font-bold mb-4">Genres</h2>
            <div className="flex flex-wrap gap-3">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedGenre === genre
                      ? 'netflix-red text-white'
                      : 'netflix-gray text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-white text-2xl font-bold">
              Popular {selectedGenre !== 'All' ? selectedGenre : ''} Anime
            </h2>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="netflix-gray text-white px-4 py-2 rounded transition-colors hover:netflix-red disabled:opacity-50"
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="text-white font-medium">Page {page}</span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="netflix-gray text-white px-4 py-2 rounded transition-colors hover:netflix-red"
              >
                Next →
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-6 w-6 text-white mx-auto mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-gray-400 text-lg">Loading anime...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAnime.map(anime => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onOpenModal={() => setModalAnime(anime)}
                  />
                ))}
              </div>
              {filteredAnime.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No anime found matching your filters.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {modalAnime && (
        <AnimeEditModal
          anime={modalAnime}
          onClose={() => setModalAnime(null)}
          onSave={() => setModalAnime(null)}
        />
      )}
    </div>
  );
}
