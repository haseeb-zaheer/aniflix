import Navbar from '@/components/Navbar';
import { getSession } from 'next-auth/react';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';
import EditProfileModal from '@/components/EditProfileModal';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function Profile({ profile, watchlist, favorites }) {
  const [modalAnime, setModalAnime] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  if (!profile) {
    return (
      <div className="netflix-dark min-h-screen flex items-center justify-center text-white text-xl">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="netflix-dark min-h-screen">
      <Navbar />

      <div className="relative h-96 w-full">
        <img
          src={localProfile.banner}
          className="w-full h-full object-cover object-center"
          alt="Profile banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute -bottom-20 left-0 w-full px-8 flex items-end justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={localProfile.avatar}
              className="w-32 h-32 rounded-full border-4 border-netflix-red shadow-2xl"
              alt="Profile avatar"
            />
            <h2 className="text-white text-3xl font-bold mb-3">{localProfile.name}</h2>
          </div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/auth' })}
              className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 pt-24 pb-16">
        <section className="mb-12">
          <div className="flex space-x-8 mb-8">
            <div className="netflix-gray p-6 rounded-lg flex-1">
              <h3 className="text-red-600 text-xl font-bold mb-2">Total Watched</h3>
              <p className="text-white text-3xl">{localProfile.totalWatched}</p>
            </div>

            <div className="netflix-gray p-6 rounded-lg flex-1">
              <h3 className="text-red-600 text-xl font-bold mb-2">About Me</h3>
              <p className="text-gray-300">{localProfile.description}</p>
              <button
                className="mt-4 text-netflix-red hover:text-red-700 transition-colors"
                onClick={() => setShowEditModal(true)}
              >
                Edit Description
              </button>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">My List</h2>
          </div>
          {watchlist.length === 0 ? (
            <p className="text-gray-400">No anime in your list yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchlist.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onOpenModal={() => setModalAnime(anime)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">Favorite Anime</h2>
          </div>
          {favorites.length === 0 ? (
            <p className="text-gray-400">You haven’t favorited any anime yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </section>
      </div>

      {modalAnime && (
        <AnimeEditModal
          anime={modalAnime}
          onClose={() => setModalAnime(null)}
          onSave={() => setModalAnime(null)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          currentDescription={localProfile.description}
          onClose={() => setShowEditModal(false)}
          onSave={async ({ description, profilePictureUrl, bannerImageUrl }) => {
            try {
              await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  description,
                  profilePicture: profilePictureUrl,
                  bannerImage: bannerImageUrl,
                }),
              });
              setLocalProfile({
                ...localProfile,
                description,
                avatar: profilePictureUrl || localProfile.avatar,
                banner: bannerImageUrl || localProfile.banner,
              });
              setShowEditModal(false);
            } catch (err) {
              console.error('Failed to update profile:', err);
            }
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

  const fetchWithCookies = async (path) => {
    const res = await fetch(`${process.env.NEXTAUTH_URL}${path}`, {
      headers: {
        cookie: context.req.headers.cookie || '',
      },
    });
    if (!res.ok) 
      throw new Error(`Failed to fetch ${path}`);
    return await res.json();
  };

  try {
    const { profile: p } = await fetchWithCookies('/api/profile');
    const watchlistRes = await fetchWithCookies('/api/watchlist');
    const favRes = await fetchWithCookies('/api/favorites');

    return {
      props: {
        profile: {
          name: p.username,
          avatar: p.profilePicture || '/profile.jpg',
          banner: p.bannerImage || '/profile-banner.jpeg',
          description: p.description || 'No description yet...',
          totalWatched: p.totalAnimeWatched || 0,
        },
        watchlist: watchlistRes.map((item) => ({
          id: item.animeId,
          title: item.animeTitle,
          episodes: item.totalEpisodes,
          rating: item.userScore,
          image: item.imageUrl,
        })),
        favorites: favRes.favoritesList.map((item) => ({
          id: item.animeId,
          title: item.title,
          episodes: item.episodes,
          rating: item.rating,
          image: item.image,
        })),
      },
    };
  } catch (err) {
    console.error('Profile GSSP error:', err);
    return {
      props: {
        profile: null,
        watchlist: [],
        favorites: [],
      },
    };
  }
}
