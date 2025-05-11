import { useRouter } from 'next/router';

export default function AnimeCard({ anime, onOpenModal }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/anime/${anime.id}`);
  };

  return (
    <div className="netflix-dark group relative cursor-pointer rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:z-10 shadow-xl">
      {/* Blurred Background */}
      <div className="absolute inset-0">
        <img
          src={anime.image}
          alt=""
          className="w-full h-full object-cover filter blur-md scale-110 opacity-30"
        />
      </div>

      {/* Letterboxed Main Image */}
      <div className="relative z-10 w-full h-64 flex items-center justify-center">
        <img
          src={anime.image}
          alt={anime.title}
          className="max-h-full max-w-full object-contain transition-opacity duration-300 group-hover:opacity-40"
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black via-60% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <h3 className="text-white text-xl font-bold mb-2">{anime.title}</h3>
        <div className="flex justify-between items-center text-gray-300 text-sm">
          <span>{anime.rating} ★</span>
          <span>{anime.episodes} episodes</span>
        </div>

        <div className="mt-3 flex space-x-2">
          {/* Details Button */}
          <button
            className="netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center"
            onClick={handleClick}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Details
          </button>

          {/* Plus Button */}
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="bg-netflix-red text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-2xl font-bold shadow-md"
              title="Add to Watchlist"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
