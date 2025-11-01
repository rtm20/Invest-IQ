/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  webpack: (config, { isServer }) => {
    // Handle client-only libraries - don't bundle them for server
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      
      // Point server-side imports to empty modules
      config.resolve.alias['pdfjs-dist'] = false;
      config.resolve.alias['mammoth'] = false;
    }
    
    // Handle PDF parsing on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };
    }
    
    // Exclude google-cloud-key.json from webpack processing
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /google-cloud-key\.json$/,
      type: 'asset/resource',
    });
    
    // Ignore node-specific modules in browser
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    
    return config;
  },
  images: {
    domains: ['storage.googleapis.com'],
  },
}

module.exports = nextConfig
