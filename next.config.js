/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Configuração para PostgreSQL - não incluir no bundle do cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Não incluir módulos Node.js no bundle do cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        pg: false,
        'pg-native': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
