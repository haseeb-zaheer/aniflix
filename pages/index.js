import {useSession, signIn, signOut} from 'next-auth/react'
import { useEffect, useState } from 'react';
import UsernameForm from '@/components/user/usernameForm';

export default function Home() {
  const {data:session, status} = useSession();
  const [username, setUsername] = useState(null);

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

  async function checkUsername(){
    try{
      const response = await fetch('api/user');
      if(!response.ok)
      {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  return (
    <div>
      {session && status === "authenticated" && username === null?
        <UsernameForm/>
      :
      <div>
        <button onClick={() => {
          signIn("google")
        }}>Sign in with Google</button>
        <p></p>
        <button onClick={getAnime}>Send API req for all anime, setup the .env.local file and login to google first</button>
        <p></p>
        <button onClick={() => signOut()}>Sign out</button>
        <p></p>
      </div>
      }
    </div>
  );
}
