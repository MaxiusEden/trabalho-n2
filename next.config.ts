import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `better-sqlite3` é um módulo nativo (.node) e não pode ser empacotado pelo
  // bundler — precisa ser carregado direto do node_modules em tempo de execução.
  serverExternalPackages: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],

  images: {
    // As capas de curso semeadas apontam para o placehold.co, como no projeto original.
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};

export default nextConfig;
