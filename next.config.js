/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "gjt8fcuvq4tthfym.public.blob.vercel-storage.com",
      },
    ],
  },
};

module.exports = nextConfig;
