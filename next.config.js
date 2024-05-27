/** @type {import('next').NextConfig} */
const pathname = process.env.NODE_ENV === 'development' ? '/gen-ai-doc-bucket-1-testing/**' : '/gen-ai-doc-bucket-1-production/**'

const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias.canvas = false

    return config
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: pathname
      }
    ]
  }
}

module.exports = nextConfig
