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
  // Base path for GitHub Pages (detected via GITHUB_PAGES env var)
  ...(process.env.GITHUB_PAGES && {
    basePath: '/al-tanzeel-react',
    assetPrefix: '/al-tanzeel-react',
  }),
};

module.exports = nextConfig;
