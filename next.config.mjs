/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/images/**', // allow all images under /images/
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
