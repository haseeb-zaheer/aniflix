import {useSession, signIn, signOut} from 'next-auth/react'
import { useEffect, useState } from 'react';
import UsernameForm from '@/components/user/usernameForm';
import Image from 'next/image';

export default function Home() {
  const {data:session, status} = useSession();
  const [username, setUsername] = useState(null);

  const [animeIdInput, setAnimeIdInput] = useState('');
  const [animeData, setAnimeData] = useState(null);
  const [statusInput, setStatusInput] = useState('watching');
  const [scoreInput, setScoreInput] = useState(0);
  const [episodesWatchedInput, setEpisodesWatchedInput] = useState(0);

  async function getAnime(){
    try{
      const response = await fetch('/api/anime');
      if(!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log(data);
    }
    catch(error)
    {
      console.error('Failed to fetch anime list, Error Message: ', error.message);
    }
  }

  async function checkUsername(){
    try{
      const response = await fetch('api/user');
      if(!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setUsername(data.username);
    }
    catch(error)
    {
      console.error(error.message);
    }
  }

  useEffect(()=>{
    if (session && status ==="authenticated")
      checkUsername();
  },[session, status])

  async function getSpecificAnime() {
    if (!animeIdInput) return alert('Enter an anime ID first.');
    try {
      const response = await fetch(`/api/anime/${animeIdInput}`);
      if (!response.ok) 
          throw new Error(`HTTP error! status: ${response.status}`);
      
      const res = await response.json();
      const data = res.data; 
  
      setAnimeData({
        animeId: Number(data.mal_id),
        title: data.title,
        imageUrl: data.images?.jpg?.image_url || '',
        totalEpisodes: data.episodes || 0
      });
  
      console.log('Fetched anime:', data);
    } 
    catch (error) {
      console.error('Failed to fetch specific anime:', error.message);
    }
  }
  
  async function addAnime() {
    if (!animeData) return alert('Fetch anime data first.');

    try {
      const response = await fetch(`/api/watchlist/${animeData.animeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusInput,
          userScore: scoreInput,
          episodesWatched: episodesWatchedInput,
          totalEpisodes: animeData.totalEpisodes,
          imageUrl: animeData.imageUrl,
          animeTitle: animeData.title
        })
      });

      const result = await response.json();
      console.log('Add anime result:', result);
      alert(result.message || 'Anime added!');
    } catch (error) {
      console.error('Failed to add anime:', error.message);
    }
  }

  async function getWatchList(){
    try{
      const response = await fetch(`/api/watchlist`)
      if (!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log(data);
    } 
    catch (error) {
      console.error('Failed to fetch anime list:', error.message);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {session && status === 'authenticated' && username === null ? (
        <UsernameForm />
      ) : (
        <div>
          <h2>AniFlix Test Panel</h2>
          <button onClick={getAnime}>Fetch all anime</button>

          <div style={{ marginTop: '20px' }}>
            <h3>Get Specific Anime</h3>
            <input
              type="text"
              placeholder="Enter anime ID"
              value={animeIdInput}
              onChange={(e) => setAnimeIdInput(e.target.value)}
            />
            <button onClick={getSpecificAnime}>Fetch Anime Data</button>
          </div>

          <div>
            <h3> Get user Watch List</h3>
            <button onClick={getWatchList}>Fetch List</button>
          </div>

          {animeData && (
            <div style={{ marginTop: '20px' }}>
              <h3>Fetched Anime:</h3>
              <p><strong>Title:</strong> {animeData.title}</p>
              <p><strong>Total Episodes:</strong> {animeData.totalEpisodes}</p>
              <Image
                src={animeData.imageUrl}
                width={150}
                height={150}
                alt={animeData.title}
              />
              <br /><br />
              <label>Status:</label>
              <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="plan-to-watch">Plan to Watch</option>
                <option value="on-hold">On Hold</option>
                <option value="dropped">Dropped</option>
              </select>
              <br />
              <label>Score:</label>
              <input type="number" value={scoreInput} onChange={(e) => setScoreInput(Number(e.target.value))} />
              <br />
              <label>Episodes Watched:</label>
              <input
                type="number"
                value={episodesWatchedInput}
                onChange={(e) => setEpisodesWatchedInput(Number(e.target.value))}
              />
              <br /><br />
              <button onClick={addAnime}>Add to Watchlist</button>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            {!session ? (
              <button onClick={() => signIn('google')}>Sign in with Google</button>
            ) : (
              <button onClick={() => signOut()}>Sign out</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
