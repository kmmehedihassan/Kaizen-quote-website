// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: {
          loader: 'node-loader',
          options: { name: '[path][name].[ext]' },
        },
      });
    }
    return config;
  },
};

export default nextConfig;
