/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.gritmarkets.com" }],
        destination: "https://gritmarkets.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
