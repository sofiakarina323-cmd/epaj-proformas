import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceso desde túneles ngrok (free tier usa *.ngrok-free.app)
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.ngrok.app',
  ],
};

export default nextConfig;
