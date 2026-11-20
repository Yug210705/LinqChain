import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.56.1', '192.168.56.1:3000', 'localhost:3000', 'localhost'],
  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/supplier/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/manufacturer/login',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
