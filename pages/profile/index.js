import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import AnimeCard from '@/components/AnimeCard';
import AnimeEditModal from '@/components/AnimeEditModal';

export default function Profile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAnime, setModalAnime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      try {
        setLoading(true);

        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        setProfile({
          name: profileData.username,
          avatar: profileData.profilePicture || '/defaults/avatar.jpg',
          banner: profileData.bannerImage || '/defaults/banner.jpg',
          description: profileData.description || 'No description yet...',
          totalWatched: profileData.totalAnimeWatched || 0
        });

        const watchlistRes = await fetch('/api/watchlist');
        const listData = await watchlistRes.json();

        const formattedList = listData.map(item => ({
          id: item.animeId,
          title: item.animeTitle,
          episodes: item.totalEpisodes,
          rating: item.userScore,
          image: item.imageUrl,
        }));

        setWatchlist(formattedList);
      } catch (err) {
        console.error('Profile/Watchlist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="netflix-dark min-h-screen flex items-center justify-center text-white text-xl">
        Loading profile...
      </div>
    );
  }

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

      {/* Profile Banner */}
      <div className="relative h-96 w-full">
        <img 
          src={profile.banner} 
          className="w-full h-full object-cover object-center"
          alt="Profile banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Profile Avatar */}
        <div className="absolute -bottom-20 left-8 flex items-end space-x-6">
          <img 
            src={profile.avatar} 
            className="w-32 h-32 rounded-full border-4 border-netflix-red shadow-2xl"
            alt="Profile avatar"
          />
          <button className="bg-white text-black mb-4 px-6 py-2 rounded hover:bg-gray-200 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-8 pt-24">
        {/* Overview */}
        <section className="mb-12">
          <h1 className="text-white text-4xl font-bold mb-4">{profile.name}</h1>
          
          <div className="flex space-x-8 mb-8">
            <div className="netflix-gray p-6 rounded-lg flex-1">
              <h3 className="text-red-600 text-xl font-bold mb-2">Total Watched</h3>
              <p className="text-white text-3xl">{profile.totalWatched}</p>
            </div>
            
            <div className="netflix-gray p-6 rounded-lg flex-1">
              <h3 className="text-red-600 text-xl font-bold mb-2">About Me</h3>
              <p className="text-gray-300">{profile.description}</p>
              <button className="mt-4 text-netflix-red hover:text-red-700 transition-colors">
                Edit Description
              </button>
            </div>
          </div>
        </section>

        {/* Watchlist Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">My List</h2>
          </div>
          
          {watchlist.length === 0 ? (
            <p className="text-gray-400">No anime in your list yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchlist.map(anime => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onOpenModal={() => setModalAnime(anime)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Reusable Anime Modal */}
      {modalAnime && (
        <AnimeEditModal
          anime={modalAnime}
          onClose={() => setModalAnime(null)}
          onSave={() => {
            setModalAnime(null);
            // refresh watchlist after save
            if (session) {
              fetch('/api/watchlist')
                .then(res => res.json())
                .then(data => {
                  const formatted = data.map(item => ({
                    id: item.animeId,
                    title: item.animeTitle,
                    episodes: item.totalEpisodes,
                    rating: item.userScore,
                    image: item.imageUrl,
                  }));
                  setWatchlist(formatted);
                });
            }
          }}
        />
      )}
    </div>
  );
}
