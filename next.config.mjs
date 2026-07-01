/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', '@sparticuz/chromium', 'playwright-core'],
  },
  outputFileTracingIncludes: {
    '/api/scrape-slugs': ['./node_modules/@sparticuz/chromium/bin/**/*'],
  },
}

export default nextConfig
