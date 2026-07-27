/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/hackathons',
        destination: 'http://localhost:3000/hackathons',
      },
      {
        source: '/api/hackathons',
        destination: 'http://localhost:3000/hackathons',
      },
    ];
  },
};

export default nextConfig;
