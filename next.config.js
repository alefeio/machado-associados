/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  
  // Configuração para o Webpack tradicional
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        async_hooks: false,
      };
    }
    return config;
  },

  experimental: {
    // RESOLUÇÃO DO ERRO: Adiciona suporte ao Turbopack espelhando as travas do Webpack
    turbopack: {
      resolveAlias: {
        fs: false,
        async_hooks: false,
      },
    },
    // Otimização para pacotes que devem rodar apenas no servidor (Prisma, Auth, etc)
    serverExternalPackages: ['@prisma/client', 'resend', '@auth/prisma-adapter'],
  },
};

module.exports = nextConfig;