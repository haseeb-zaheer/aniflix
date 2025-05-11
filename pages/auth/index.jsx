// pages/auth.js
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import UsernameForm from '@/components/user/usernameForm';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to check username');
        const { username } = await response.json();
        setUsername(username);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session && status === 'authenticated') {
      checkUsername();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <div className="min-h-screen netflix-dark text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen netflix-dark text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to AniFlix</h1>

        {!session ? (
          <>
            <p className="mb-4">Sign in to get started</p>
            <button
              onClick={() => signIn('google')}
              className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Sign in with Google
            </button>
          </>
        ) : username === null ? (
          <>
            <p className="mb-4">Finish setting up your profile:</p>
            <UsernameForm />
            <button
              onClick={() => signOut()}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">You're already signed in as <strong>{session.user.name}</strong>.</p>
            <button
              onClick={() => signOut()}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
