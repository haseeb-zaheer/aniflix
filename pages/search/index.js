import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';

export default function SearchPage() {
  const router = useRouter();
  const { q, page = '1' } = router.query;

  const [results, setResults] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalAnime, setModalAnime] = useState(null);

  const currentPage = parseInt(page);

  useEffect(() => {
    if (!q) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anime/search?search=${encodeURIComponent(q)}&page=${currentPage}`);
        const { results: fetchedResults, hasNextPage } = await res.json();

        setResults(Array.isArray(fetchedResults) ? fetchedResults : []);
        setHasNextPage(Boolean(hasNextPage));
      } catch (err) {
        console.error('Failed to fetch search results:', err);
        setResults([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, currentPage]);

  const handlePageChange = (newPage) => {
    router.push(`/search?q=${encodeURIComponent(q)}&page=${newPage}`);
  };

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />

      <main className="pt-24 px-4 md:px-12">
        <h1 className="text-white text-3xl font-bold mb-6">
          Search Results for: <span className="text-netflix-red">{q}</span>
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-6 w-6 text-white mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-gray-400 text-lg">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-lg">No results found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
              {results.map(anime => (
                <AnimeCard
                  key={anime.id}
                  anime={{
                    id: anime.id,
                    title: anime.title.romaji,
                    rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A',
                    episodes: anime.episodes ?? 'N/A',
                    image: anime.coverImage?.large || '/placeholder.jpg'
                  }}
                  onOpenModal={() => setModalAnime({
                    id: anime.id,
                    title: anime.title.romaji,
                    image: anime.coverImage?.large || '/placeholder.jpg',
                    episodes: anime.episodes ?? 'N/A'
                  })}
                />
              ))}
            </div>

            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-netflix-red transition-colors disabled:opacity-50"
                disabled={currentPage <= 1}
              >
                ← Prev
              </button>
              <span className="text-white font-semibold">Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-netflix-red transition-colors disabled:opacity-50"
                disabled={!hasNextPage}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {modalAnime && (
          <AnimeEditModal
            anime={modalAnime}
            onClose={() => setModalAnime(null)}
            onSave={() => setModalAnime(null)}
          />
        )}
      </main>
    </div>
  );
}
