import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app", "localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Supabase Storage — fotos de negocios
      },
    ],
  },
};

export default withNextIntl(nextConfig);
