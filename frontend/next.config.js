/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  turbopack: {
    root: process.cwd(),
  },
};
module.exports = nextConfig;
