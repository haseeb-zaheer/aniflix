/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    domains: ['res.cloudinary.com', 's4.anilist.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/images/**', 
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
