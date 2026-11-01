/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // The dashboard used to live at /dashboard/bdo; keep old bookmarks working.
  async redirects() {
    return [{ source: "/dashboard/bdo", destination: "/dashboard", permanent: true }];
  },
};

export default nextConfig;
