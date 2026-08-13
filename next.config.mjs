/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  async rewrites() {
    const backendUrl = process.env.RAILWAY_API_URL?.replace(/\/$/, '');

    return backendUrl
      ? {
          beforeFiles: [
            {
              source: '/api/:path*',
              destination: `${backendUrl}/:path*`,
            },
          ],
        }
      : { beforeFiles: [] };
  },
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
};

export default nextConfig;
