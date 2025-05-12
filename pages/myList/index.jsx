import Navbar from '@/components/Navbar';
import { getSession } from 'next-auth/react';
import AnimeEditModal from '@/components/AnimeEditModal';
import MyListItem from '@/components/MyListItem';
import { useState } from 'react';

export default function MyList({ animeList }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalAnime, setModalAnime] = useState(null);
  const [list, setList] = useState(animeList);

  const filteredList =
    selectedStatus === 'all'
      ? list
      : list.filter((anime) => anime.status === selectedStatus);

  const refreshList = async () => {
    try {
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
      setList(formatted);
    } catch (err) {
      console.error('Failed to reload watchlist:', err);
    }
  };

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

        {filteredList.length === 0 ? (
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
            refreshList();
          }}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/watchlist`, {
      headers: {
        cookie: context.req.headers.cookie || '',
      },
    });

    if (!res.ok)
      throw new Error('Failed to fetch watchlist');

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

    return {
      props: {
        animeList: formatted,
      },
    };
  } catch (err) {
    console.error('GSSP watchlist error:', err);
    return {
      props: {
        animeList: [],
      },
    };
  }
}
