import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // As capas de curso semeadas apontam para o placehold.co, como no projeto original.
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};

export default nextConfig;
