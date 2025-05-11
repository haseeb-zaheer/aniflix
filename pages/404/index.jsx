import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/auth-bg-2.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      <div className="relative z-10 w-[300px] bg-[#141414] p-6 rounded-lg shadow-lg text-center border border-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-4">404</h1>
        <p className="text-gray-300 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-[#e50914] hover:bg-[#b20710] text-white py-2 px-6 rounded font-semibold text-sm transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
