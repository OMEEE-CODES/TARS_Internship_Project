/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["convex"]
  },
  // Disable static generation for all pages
  output: 'standalone',
};

module.exports = nextConfig;
