/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "sequelize-typescript"],
    runtime: 'experimental-edge',
  },
};

export default nextConfig;
