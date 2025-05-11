import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const statusLabels = {
  watching: 'Watching',
  completed: 'Completed',
  'plan-to-watch': 'Plan to Watch',
  'on-hold': 'On Hold',
  dropped: 'Dropped',
};

export default function AnimeEditModal({ anime, onClose, onSave }) {
  const [status, setStatus] = useState(anime.status || 'plan-to-watch');
  const [rating, setRating] = useState(anime.rating || 0);
  const [watched, setWatched] = useState(anime.watched || 0);
  const [releaseDate, setReleaseDate] = useState(anime.releaseDate || null);
  const [hasReleased, setHasReleased] = useState(anime.hasReleased ?? true);
  const [loading, setLoading] = useState(releaseDate === null); // if releaseDate not passed, set loading

  useEffect(() => {
    if (releaseDate !== null) return;

    const getReleaseInfo = async () => {
      try {
        const res = await fetch(`/api/anime/${anime.id}`);
        const data = await res.json();
        const start = data.startDate;

        const released = start?.year && start?.month && start?.day
          ? new Date(start.year, start.month - 1, start.day) <= new Date()
          : false;

        const formatted = start?.year
          ? `${start.day || '??'}/${start.month || '??'}/${start.year}`
          : 'Unannounced';

        setReleaseDate(formatted);
        setHasReleased(released);
      } catch (err) {
        toast.error('Could not fetch release date');
        setReleaseDate('Unknown');
        setHasReleased(true);
      } finally {
        setLoading(false);
      }
    };

    getReleaseInfo();
  }, [anime.id, releaseDate]);

  const handleSave = async () => {
    if (
      ['watching', 'completed', 'on-hold', 'dropped'].includes(status) &&
      !hasReleased
    ) {
      toast.error('This anime has not released yet. Only "Plan to Watch" is allowed.');
      return;
    }

    try {
      const res = await fetch(`/api/watchlist/${anime.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeTitle: anime.title,
          imageUrl: anime.image,
          totalEpisodes: anime.episodes || 0,
          status,
          userScore: rating,
          episodesWatched: watched
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');

      toast.success('Watchlist updated!');
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
      <div className="netflix-gray/90 p-6 rounded-lg w-full max-w-lg text-white relative">
        <button
          className="absolute top-2 right-3 text-gray-300 hover:text-white text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">{anime.title}</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-6 w-6 text-white mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Loading release info...</span>
          </div>
        ) : (
          <>
            <img
              src={anime.image}
              alt={anime.title}
              className="w-40 h-60 object-cover rounded mb-4"
            />

            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-white">Release Date:</span>{' '}
              {releaseDate || 'Unknown'}
            </p>

            <p className="mb-2">Total Episodes: {anime.episodes}</p>

            <label className="block mb-2">
              Status:
              <select
                className="w-full mt-1 p-2 netflix-gray text-white rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {Object.keys(statusLabels).map((key) => {
                  const disabled =
                    ['watching', 'completed', 'on-hold', 'dropped'].includes(key) && !hasReleased;
                  return (
                    <option key={key} value={key} disabled={disabled}>
                      {statusLabels[key]} {disabled ? '(Unavailable)' : ''}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="block mb-2">
              Episodes Watched:
              <input
                type="number"
                className="w-full mt-1 p-2 netflix-gray text-white rounded"
                value={watched}
                onChange={(e) => setWatched(Number(e.target.value))}
                min={0}
                max={anime.episodes}
              />
            </label>

            <label className="block mb-4">
              Rating (out of 10):
              <input
                type="number"
                className="w-full mt-1 p-2 netflix-gray text-white rounded"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={0}
                max={10}
              />
            </label>

            <button
              onClick={handleSave}
              className="netflix-red px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
