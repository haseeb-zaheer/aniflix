import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UsernameForm from '@/components/user/usernameForm';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to check username');
        const { profile } = await response.json();
        if (profile?.username) {
          setUsername(profile.username);
          router.push('/');
        } else {
          setUsername(null);
        }
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
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/auth-bg-2.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      <div className="relative z-10 w-[300px] bg-[#141414] p-6 rounded-lg shadow-lg text-center border border-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-4">Welcome to AniFlix</h1>

        {!session ? (
          <>
            <p className="mb-4 text-gray-300 text-sm">Join us or log in to continue</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn('google')}
                className="bg-[#e50914] hover:bg-[#b20710] text-white py-2 rounded font-semibold text-sm transition"
              >
                Sign Up with Google
              </button>
              <button
                onClick={() => signIn('google')}
                className="bg-transparent border border-[#e50914] text-[#e50914] hover:bg-[#e50914] hover:text-white py-2 rounded font-semibold text-sm transition"
              >
                Login with Google
              </button>
            </div>
          </>
        ) : username === null ? (
          <>
            <p className="mb-3 text-gray-300 text-sm">Finish setting up your profile:</p>
            <UsernameForm
              onSuccess={() => {
                router.push('/');
              }}
            />
            <button
              onClick={() => signOut()}
              className="mt-4 text-xs text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-gray-300 text-sm">
              You're already signed in as <strong>{session.user.name}</strong>.
            </p>
            <button
              onClick={() => signOut()}
              className="bg-[#e50914] hover:bg-[#b20710] text-white px-4 py-2 rounded text-sm transition"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
