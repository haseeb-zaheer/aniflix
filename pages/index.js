import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';
import getCurrentSeasonAndYear from '@/utils/currentDate';
import Image from 'next/image';

export default function Home({ mostLiked, currentlyAiring }) {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />

      <main className="pt-20 px-4 md:px-12">
        <div className="relative h-96 rounded-lg overflow-hidden mb-12">
          <Image
            src={
              mostLiked[currentSlide]?.bannerImage ||
              mostLiked[currentSlide]?.coverImage?.extraLarge ||
              '/default-banner.jpg'
            }
            fill
            alt={mostLiked[currentSlide]?.title.romaji || 'Banner'}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent p-8 flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-white text-5xl font-bold mb-4">
                {mostLiked[currentSlide]?.title.romaji}
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Episodes: {mostLiked[currentSlide]?.episodes || 'N/A'} | Score:{' '}
                {mostLiked[currentSlide]?.averageScore
                  ? (mostLiked[currentSlide].averageScore / 10).toFixed(1)
                  : 'N/A'}
              </p>
              <div className="flex space-x-4">
              <button
                onClick={() =>
                  window.location.href = `/anime/${mostLiked[currentSlide]?.id}`
                }
                className="netflix-red text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
                >
                Details
              </button>

              <button
                onClick={() =>
                  setSelectedAnime({
                    id: mostLiked[currentSlide]?.id,
                    title: mostLiked[currentSlide]?.title.romaji,
                    image: mostLiked[currentSlide]?.coverImage?.large,
                    episodes: mostLiked[currentSlide]?.episodes,
                  })
                }
                className="bg-gray-600 bg-opacity-70 text-white px-6 py-3 rounded-lg text-lg hover:bg-opacity-40 transition-colors flex items-center"
                >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add
                </button>
            </div>

            </div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">Popular Anime</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mostLiked.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={{
                  id: anime.id,
                  title: anime.title.romaji,
                  rating: anime.averageScore
                    ? (anime.averageScore / 10).toFixed(1)
                    : 'N/A',
                  episodes: anime.episodes,
                  image: anime.coverImage.large,
                }}
                onOpenModal={() =>
                  setSelectedAnime({
                    id: anime.id,
                    title: anime.title.romaji,
                    image: anime.coverImage.large,
                    episodes: anime.episodes,
                  })
                }
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">
            Currently Airing Anime
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentlyAiring.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={{
                  id: anime.id,
                  title: anime.title.romaji,
                  rating: anime.averageScore
                    ? (anime.averageScore / 10).toFixed(1)
                    : 'N/A',
                  episodes: anime.episodes,
                  image: anime.coverImage.large,
                }}
                onOpenModal={() =>
                  setSelectedAnime({
                    id: anime.id,
                    title: anime.title.romaji,
                    image: anime.coverImage.large,
                    episodes: anime.episodes,
                  })
                }
              />
            ))}
          </div>
        </section>
      </main>

      {selectedAnime && (
        <AnimeEditModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onSave={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
}

export async function getStaticProps() {
  const fetchAniListData = async (query, variables = {}) => {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) 
      throw new Error('Failed to fetch AniList data');
    const { data } = await response.json();
    return data.Page.media;
  };

  const { season, year } = getCurrentSeasonAndYear();

  const POPULAR_ANIME_QUERY = `
    query {
      Page(perPage: 12) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          id
          title {
            romaji
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          episodes
          averageScore
        }
      }
    }
  `;

  const CURRENTLY_AIRING_QUERY = `
    query ($season: MediaSeason, $year: Int) {
      Page(perPage: 25) {
        media(
          season: $season,
          seasonYear: $year,
          type: ANIME,
          status: RELEASING,
          isAdult: false
        ) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          episodes
          averageScore
          nextAiringEpisode {
            airingAt
          }
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  try {
    const [mostLiked, airingRaw] = await Promise.all([
      fetchAniListData(POPULAR_ANIME_QUERY),
      fetchAniListData(CURRENTLY_AIRING_QUERY, { season, year }),
    ]);

    const now = new Date();
    const currentlyAiring = airingRaw
      .filter((anime) => {
        const { year, month, day } = anime.startDate || {};
        if (!year || !month || !day) return false;
        const startDate = new Date(year, month - 1, day);
        return startDate <= now;
      })
      .slice(0, 12);

    return {
      props: {
        mostLiked,
        currentlyAiring,
      },
      revalidate: 30, 
    };
  } catch (error) {
    console.error('Error fetching AniList data:', error);
    return {
      props: {
        mostLiked: [],
        currentlyAiring: [],
      },
      revalidate: 30,
    };
  }
}
