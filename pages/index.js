import {useSession, signIn, signOut} from 'next-auth/react'

export default function Home() {

  async function getAnime(){
    try{
      const response = await fetch('/api/anime');
      if(!response.ok)
      {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    }
    catch(error)
    {
      console.error('Failed to fetch anime list, Error Message: ', error.message);
    }
    
  }

  return (
    <div>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <p></p>
      <button onClick={getAnime}>Send API req for all anime</button>
      <p></p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
