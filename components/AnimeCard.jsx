import { useRouter } from 'next/router';
import Image from 'next/image';

export default function AnimeCard({ anime, onOpenModal }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/anime/${anime.id}`);
  };

  return (
    <div className="netflix-dark group relative cursor-pointer rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:z-10 shadow-xl">

      <div className="absolute inset-0">
        <Image
          src={anime.image}
          alt=""
          fill
          className="object-cover filter blur-md scale-110 opacity-30"
          unoptimized
        />
      </div>

      
      <div className="relative z-10 w-full h-64 flex items-center justify-center">
        <Image
          src={anime.image}
          alt={anime.title}
          width={200}
          height={300}
          className="max-h-full max-w-full object-contain transition-opacity duration-300 group-hover:opacity-40"
          unoptimized
        />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black via-60% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <h3 className="text-white text-xl font-bold mb-2">{anime.title}</h3>
        <div className="flex justify-between items-center text-gray-300 text-sm">
          <span>{anime.rating} ★</span>
          <span>{anime.episodes} episodes</span>
        </div>

        <div className="mt-3 flex space-x-2">
          <button
            className="netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center"
            onClick={handleClick}
          >
            Details
          </button>

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
