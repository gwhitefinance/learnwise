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
    // remotePatterns are no longer needed as we are using local images.
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1756830492445.cluster-bp7tn4kmnjchatd3dgbbvk2kko.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
