// pages/anime/[id].js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const statusOptions = [
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'Plan to Watch', value: 'plan-to-watch' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Dropped', value: 'dropped' }
];

export default function AnimeDetail({ anime }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState('watching');
  const [watchedEpisodes, setWatchedEpisodes] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [progress, setProgress] = useState(0);

  if (!anime) {
    return (
      <div className="netflix-dark min-h-screen flex items-center justify-center text-white">
        <p>Anime not found.</p>
      </div>
    );
  }

  useEffect(() => {
    if (!id || !session) return;

    const checkFavoriteStatus = async () => {
      try {
        const res = await fetch(`/api/favorites/${id}`);
        const data = await res.json();
        if (data.favorite) setIsFavorite(true);
      } catch (err) {
        console.error('Error checking favorite:', err.message);
      }
    };

    checkFavoriteStatus();
  }, [id, session]);

  useEffect(() => {
    if (!session?.user?.id || !anime?.id) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/watchlist/${anime.id}`);
        const { anime: userData } = await res.json();
        if (userData) {
          setStatus(userData.status || 'watching');
          setWatchedEpisodes(userData.episodesWatched || 0);
          setUserRating(userData.userScore || 0);
        }
      } catch (err) {
        toast.error('Failed to load user watchlist data.');
        console.error(err.message);
      }
    };

    fetchUserData();
  }, [anime?.id, session?.user?.id]);

  useEffect(() => {
    if (anime?.totalEpisodes > 0 && !isNaN(watchedEpisodes)) {
      const calculated = Math.min(100, Math.max(0, (watchedEpisodes / anime.totalEpisodes) * 100));
      setProgress(calculated);
    } else {
      setProgress(0);
    }
  }, [watchedEpisodes, anime?.totalEpisodes]);

  const handleAddToWatchlist = async () => {
    if (!session) {
      toast.error('Please sign in to add to your watchlist.');
      return;
    }

    if (!anime) return;

    const safeStatus = statusOptions.find(opt => opt.value === status)?.value || 'watching';
    const totalEpisodes = anime.totalEpisodes;

    if (
      ['watching', 'completed', 'on-hold', 'dropped'].includes(safeStatus) &&
      anime.hasReleased === false
    ) {
      toast.error('This anime has not released yet. You can only mark it as "Plan to Watch".');
      return;
    }

    let finalWatchedEpisodes = watchedEpisodes;

    if (safeStatus === 'completed') {
      finalWatchedEpisodes = totalEpisodes;
      setWatchedEpisodes(totalEpisodes);
    }

    if (safeStatus === 'plan-to-watch') {
      finalWatchedEpisodes = 0;
      setWatchedEpisodes(0);
      setUserRating(0);
    }

    if (
      isNaN(finalWatchedEpisodes) || finalWatchedEpisodes < 0 ||
      finalWatchedEpisodes > totalEpisodes
    ) {
      toast.error('Progress must be between 0 and total episodes.');
      return;
    }

    if (isNaN(userRating) || userRating < 0 || userRating > 10) {
      toast.error('Rating must be between 0 and 10.');
      return;
    }

    try {
      const res = await fetch(`/api/watchlist/${anime.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeTitle: anime.title,
          status: safeStatus,
          userScore: userRating,
          episodesWatched: finalWatchedEpisodes,
          totalEpisodes,
          imageUrl: anime.image
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error adding to watchlist');
      toast.success(result.message || 'Added to watchlist!');
    } catch (err) {
      console.error('Add to watchlist error:', err.message);
      toast.error('Failed to add anime to watchlist.');
    }
  };

  const formattedReleaseDate = anime?.releaseDate?.year
    ? `${anime.releaseDate.day || '??'}/${anime.releaseDate.month || '??'}/${anime.releaseDate.year}`
    : 'Unannounced';

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />
      <Toaster position="top-right" />

      {anime.banner ? (
        <div className="relative h-96 w-full">
          <img src={anime.banner} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-60" />
      )}

      <div className="container mx-auto px-8 pt-4 relative z-10 -mt-28 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <img
            src={anime.image}
            className="w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 object-cover rounded-md shadow-lg border-2 border-gray-700 mx-auto"
            alt={anime.title}
          />
          <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm p-4 rounded-lg">
            <div><h4 className="font-semibold">Total Episodes</h4><p>{anime.totalEpisodes}</p></div>
            <div><h4 className="font-semibold">Community Rating</h4><p>{anime.rating} ★</p></div>
            <div><h4 className="font-semibold">Release Date</h4><p>{formattedReleaseDate}</p></div>
          </div>
        </div>

        <div className="flex-1 text-white">
          <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={async () => {
                if (!session || !anime) return;

                try {
                  if (!isFavorite) {
                    await fetch(`/api/favorites/${anime.id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: anime.title,
                        rating: anime.rating,
                        episodes: anime.totalEpisodes,
                        image: anime.image,
                      }),
                    });
                    toast.success('Added to favorites!');
                    setIsFavorite(true);
                  } else {
                    await fetch(`/api/favorites/${anime.id}`, {
                      method: 'DELETE',
                    });
                    toast.success('Removed from favorites!');
                    setIsFavorite(false);
                  }
                } catch (err) {
                  toast.error('Favorite toggle failed.');
                  console.error(err.message);
                }
              }}
              className={`flex items-center px-6 py-3 rounded ${
                isFavorite ? 'netflix-red' : 'netflix-gray'
              } hover:bg-red-700 transition-colors`}
            >
              ❤️ {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="netflix-gray px-4 py-3 rounded focus:outline-none"
            >
              {statusOptions.map(({ label, value }) => {
                const isRestricted =
                  ['watching', 'completed', 'on-hold', 'dropped'].includes(value) &&
                  !anime.hasReleased;

                return (
                  <option key={value} value={value} disabled={isRestricted}>
                    {label} {isRestricted ? ' (Unavailable)' : ''}
                  </option>
                );
              })}
            </select>

            <button
              onClick={handleAddToWatchlist}
              className="netflix-red text-white px-6 py-3 rounded hover:bg-red-700 transition"
            >
              Add to Watchlist
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-gray-300">Progress:</span>
              <input
                type="number"
                min="0"
                max={anime.totalEpisodes}
                value={watchedEpisodes}
                onChange={(e) => setWatchedEpisodes(Number(e.target.value))}
                className="netflix-gray border border-gray-600 px-3 py-2 rounded w-24 text-white"
              />
              <span className="text-gray-300">/ {anime.totalEpisodes} episodes</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="netflix-red h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Rating (out of 10)</h3>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={userRating}
              onChange={(e) => setUserRating(Number(e.target.value))}
              className="netflix-gray border border-gray-600 px-3 py-2 rounded w-24 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genre.map((genre) => (
              <span key={genre} className="netflix-red px-3 py-1 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">{anime.description}</p>
        </div>
      </div>
    </div>
  );
}
export async function getStaticPaths() {
  const query = `
    query {
      Page(perPage: 10) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          id
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const { data } = await res.json();

    const paths = data.Page.media.map((anime) => ({
      params: { id: anime.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
  } catch (err) {
    console.error('Error in getStaticPaths:', err.message);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const animeId = params.id;
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        description
        genres
        episodes
        averageScore
        coverImage {
          large
          extraLarge
        }
        bannerImage
        startDate {
          year
          month
          day
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: parseInt(animeId) } }),
    });

    const { data } = await res.json();
    if (!data || !data.Media) {
      return { notFound: true };
    }

    const startDate = data.Media.startDate;
    const hasReleased =
      startDate?.year && startDate?.month && startDate?.day
        ? new Date(startDate.year, startDate.month - 1, startDate.day) <= new Date()
        : false;

    const anime = {
      id: data.Media.id,
      title: data.Media.title.english || data.Media.title.romaji || 'Unknown Title',
      description: data.Media.description?.replace(/<[^>]+>/g, '') || 'No description available.',
      image: data.Media.coverImage.extraLarge || data.Media.coverImage.large,
      banner: data.Media.bannerImage,
      episodes: data.Media.episodes || 0,
      genre: data.Media.genres || [],
      rating: data.Media.averageScore ? (data.Media.averageScore / 10).toFixed(1) : 'N/A',
      totalEpisodes: data.Media.episodes || 0,
      releaseDate: data.Media.startDate,
      hasReleased,
    };

    return {
      props: { anime },
      revalidate: 60,
    };
  } catch (err) {
    console.error('Error in getStaticProps:', err.message);
    return { notFound: true };
  }
}
