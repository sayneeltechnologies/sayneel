/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static HTML export for cPanel hosting; /dashboard -> /dashboard/index.html works on Apache without rewrites.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // redirects() isn't supported with static export; the old /dashboard/bdo redirect lives in public/.htaccess.
};

export default nextConfig;
