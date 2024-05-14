//TODO: Need to add to the proper bucket for production in here
/** @type {import('next').NextConfig} */
const pathname = process.env.NODE_ENV === 'development' ? '/gen-ai-doc-bucket-1-testing/**' : undefined

const nextConfig = {
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
