import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="netflix-dark fixed w-full z-50 top-0 border-b border-red-900">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="flex items-center space-x-2 ml-8">
        <Image
          src="/aniflix-logo.png"
          alt="AniFlix Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <span className="text-red-600 text-2xl font-extrabold">AniFlix</span>
        </Link>


        <div className="flex space-x-8 items-center">
          <Link href="/profile" className="text-white hover:text-gray-300 transition-colors">Profile</Link>
          <Link href="/myList" className="text-white hover:text-gray-300 transition-colors">My List</Link>
          <Link href="/browse" className="text-white hover:text-gray-300 transition-colors">Browse</Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleSearch}
              className={`netflix-gray px-4 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red 
                transition-all duration-300 ease-in-out 
                ${isSearchFocused ? 'w-72' : 'w-48'}`}
            />
            <svg
              className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}
