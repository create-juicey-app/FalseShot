/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: "url-loader",
        options: {
          limit: 8192,
          fallback: "file-loader",
          publicPath: "/_next/static/fonts/",
          outputPath: "static/fonts/",
          name: "[name]-[hash].[ext]",
        },
      },
    });
    return config;
  },
};

export default nextConfig;
