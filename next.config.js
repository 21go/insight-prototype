/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.mjs$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });
    return config;
  },
  experimental: {
    allowedDevOrigins: [
      'https://readily-helped-roughy.ngrok-free.app',
      'https://insight-prototype.vercel.app/',
    ],
  },
};

module.exports = nextConfig;
