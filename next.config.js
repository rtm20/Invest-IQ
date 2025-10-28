/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  webpack: (config, { isServer }) => {
    // Handle PDF parsing
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Exclude google-cloud-key.json from webpack processing
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /google-cloud-key\.json$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  images: {
    domains: ['storage.googleapis.com'],
  },
}

module.exports = nextConfig
