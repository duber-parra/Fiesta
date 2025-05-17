
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // Add this new pattern for i.postimg.cc
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      // Add the specific origin from the Firebase Studio warning
      '9003-firebase-studio-1747468369842.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev',
      // It might be beneficial to also allow localhost if you ever run it locally
      // 'http://localhost:9003', 
    ],
  },
};

export default nextConfig;
