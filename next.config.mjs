/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', 
  distDir: 'out',   
  images: {
    unoptimized: true 
  },
  trailingSlash: true, 
  swcMinify: true,     
  compress: false   
}

export default nextConfig;