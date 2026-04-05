// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Enable SSR for Cloudflare Pages
  ssr: true,

  // Nitro configuration for Cloudflare Pages
  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: false,
    },
    // Use Cloudflare Pages as the preset
    preset: "cloudflare-pages",
    storage: {
      redis: {
        driver: "redis",
        // Configure redis if needed
      },
    },
    // Cloudflare compatibility
    rollupConfig: {
      external: ["cloudflare:sockets"],
    },
  },

  // Remove Tauri-specific vite config and replace with web-optimized settings
  vite: {
    clearScreen: false,
    envPrefix: ["VITE_"],
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
    },
  },

  // Only include web-compatible plugins
  plugins: [
    {
      src: "~/plugins/firebase.ts",
    },
  ],

  modules: ["@nuxt/image", "nuxt-icon"],

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys that are only available server-side
    rabbitmqHost: process.env.RABBITMQ_HOST || "localhost",
    rabbitmqUsername: process.env.RABBITMQ_USERNAME || "guest",
    rabbitmqPassword: process.env.RABBITMQ_PASSWORD || "guest",
    rabbitmqPort: process.env.RABBITMQ_PORT || 5672,
    
    // Firebase private keys (from Cloudflare secrets)
    firebaseApiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    
    // Public keys that are exposed to the client
    public: {
      firebaseApiKey: process.env.VITE_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.VITE_FIREBASE_APP_ID,
    },
  },

  // Experimental features
  experimental: {
    asyncEntry: true,
  },
});
