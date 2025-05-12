import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function SearchPage({ results, hasNextPage, q, currentPage }) {
  const router = useRouter();
  const [modalAnime, setModalAnime] = useState(null);

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

        {results.length === 0 ? (
          <p className="text-gray-400 text-lg">No results found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
              {results.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={{
                    id: anime.id,
                    title: anime.title.romaji,
                    rating: anime.averageScore
                      ? (anime.averageScore / 10).toFixed(1)
                      : 'N/A',
                    episodes: anime.episodes ?? 'N/A',
                    image: anime.coverImage?.large || '/placeholder.jpg',
                  }}
                  onOpenModal={() =>
                    setModalAnime({
                      id: anime.id,
                      title: anime.title.romaji,
                      image: anime.coverImage?.large || '/placeholder.jpg',
                      episodes: anime.episodes ?? 'N/A',
                    })
                  }
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
              <span className="text-white font-semibold">
                Page {currentPage}
              </span>
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

export async function getServerSideProps(context) {
  const q = context.query.q || '';
  const page = parseInt(context.query.page || '1');

  if (!q) {
    return {
      props: {
        results: [],
        hasNextPage: false,
        q: '',
        currentPage: page,
      },
    };
  }

  try {
    const apiBase = process.env.NEXTAUTH_URL;
    const res = await fetch(`${apiBase}/api/anime/search?search=${encodeURIComponent(q)}&page=${page}`, {
      headers: {
        cookie: context.req.headers.cookie || '', 
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch results from API: ${res.status}`);
    }

    const { results = [], hasNextPage = false } = await res.json();

    return {
      props: {
        results,
        hasNextPage,
        q,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Search fetch error:', error);
    return {
      props: {
        results: [],
        hasNextPage: false,
        q,
        currentPage: page,
      },
    };
  }
}
