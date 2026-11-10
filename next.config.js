/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Ensure environment variables are available in serverless functions
  env: {
    ARK_API_KEY: process.env.ARK_API_KEY,
    BYTEPLUS_API_BASE: process.env.BYTEPLUS_API_BASE,
    BYTEPLUS_SEED_LLM_MODEL: process.env.BYTEPLUS_SEED_LLM_MODEL,
    BYTEPLUS_SEEDREAM_MODEL: process.env.BYTEPLUS_SEEDREAM_MODEL,
    BYTEPLUS_SEEDANCE_MODEL: process.env.BYTEPLUS_SEEDANCE_MODEL,
  },
};

module.exports = nextConfig;
