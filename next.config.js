/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for hosting on static platforms
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  // Ensure proper asset handling
  trailingSlash: true,
  // Base path for GitHub Pages
  basePath: '/al-tanzeel-react',
  assetPrefix: '/al-tanzeel-react',
};

module.exports = nextConfig;
