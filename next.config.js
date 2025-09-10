/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ACCOUNT: process.env.ACCOUNT,
    PASSWORD: process.env.PASSWORD
  },
}

module.exports = nextConfig