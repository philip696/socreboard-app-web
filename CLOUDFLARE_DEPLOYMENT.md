# Basketball Scoreboard - Cloudflare Pages & Workers Deployment Guide

## Overview

This guide explains how to deploy the Basketball Scoreboard app on Cloudflare Pages with backend support via Cloudflare Workers.

## Key Changes from Desktop App

### Removed Features (Desktop-Only)
- **Tauri framework** - No longer needed for web deployment
- **Serial port direct control** - Use WebSerial API instead (browser-based)
- **Desktop window management** - Removed drag-region and fullscreen Tauri APIs

### New Features (Web-Based)
- **WebSerial API support** - For direct browser access to serial devices
- **RabbitMQ HTTP API** - Server-side integration with management plugin
- **Server-side composables** - Use Cloudflare Workers for backend operations
- **Environment-based configuration** - All secrets stored in Cloudflare secrets

## Prerequisites

1. **Cloudflare Account** - Free or paid tier
2. **Domain** - For Cloudflare Pages deployment (optional, can use .pages.dev domain)
3. **Node.js** - v18+ for local development
4. **Wrangler CLI** - For Workers management

```bash
npm install -g wrangler
wrangler login
```

## Installation & Setup

### 1. Set Up Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your actual values:

```env
RABBITMQ_HOST=rabbitmq.example.com
RABBITMQ_USERNAME=your_user
RABBITMQ_PASSWORD=your_password
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase configs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Cloudflare

Edit `wrangler.toml`:

```toml
name = "scoreboard-worker"
main = "server/worker.ts"
compatibility_date = "2024-04-01"

# Set your domain if you have one
# pages_build_output_dir = ".output/public"
```

### 4. Set Up Cloudflare Secrets

Use Wrangler to store sensitive environment variables:

```bash
# Production environment
wrangler secret put RABBITMQ_HOST --env production
wrangler secret put RABBITMQ_USERNAME --env production
wrangler secret put RABBITMQ_PASSWORD --env production
wrangler secret put RABBITMQ_PORT --env production

# Development environment (if needed)
wrangler secret put RABBITMQ_HOST --env development
# ... etc
```

## Local Development

### Start Development Server

```bash
npm run dev
```

This will start:
- Nuxt dev server on `http://localhost:3000`
- Hot Module Replacement enabled

### Test Worker Locally

In a separate terminal:

```bash
npm run wrangler:dev
```

## Building for Production

### Build the Application

```bash
npm run build
```

This generates:
- Nuxt build output in `.output/`
- Server functions compiled for Workers

### Deploy to Cloudflare Pages

#### Option 1: Git Integration (Recommended)

1. Push code to GitHub
2. Connect to Cloudflare Pages:
   - Go to Cloudflare Dashboard → Pages
   - Select "Create a project"
   - Connect your GitHub account
   - Select repository
   - Set build command: `npm run build`
   - Set output directory: `.output/public`
   - Add environment variables

#### Option 2: Wrangler Command Line

```bash
npm run deploy
```

## Architecture

### Frontend (Nuxt on Cloudflare Pages)
- **Location**: `pages/`, `components/`, `composables/`
- **Build output**: `.output/public/` → Deployed to CDN
- **Runtime**: Browser (Client-side rendering + hydration)

### Backend (Cloudflare Workers)
- **Location**: `server/api/` (Nitro routes)
- **Runtime**: V8 isolate on Cloudflare edge
- **Responsibilities**:
  - RabbitMQ message publishing
  - Hardware serial control (if applicable)
  - Configuration management

### Communication

Browser ↔ Cloudflare API Routes ↔ RabbitMQ / External Services

```
┌─────────────────┐
│  Browser (Web)  │
│   (Vue Components)
└────────┬────────┘
         │ HTTP
         ↓
┌──────────────────────────┐
│ Cloudflare Workers       │
│ (Server API Routes)      │
└────────┬─────────────────┘
         │ AMQP HTTP API
         ↓
┌──────────────────┐
│  RabbitMQ        │
│  (Management)    │
└──────────────────┘
```

## Hardware Integration

### WebSerial API (Browser-based, for direct device access)

If running on a device with USB access:

```typescript
import { useSerialPort } from "~/composables/useSerialPort";

export default {
  setup() {
    const serial = useSerialPort();
    
    return {
      async connectArduino() {
        if (!serial.isWebSerialAvailable()) {
          console.log("WebSerial not available on this device");
          return;
        }
        
        await serial.requestPort();
        await serial.connect({ baudRate: 9600 });
        await serial.triggerAlarm(5); // 5 second alarm
      },
    };
  },
};
```

**Browser Support**: Chrome, Edge (Chromium-based browsers only)

### Server-side Serial Control (Alternative)

For remote/headless deployment:

1. Deploy a separate serial proxy service
2. Call it via API endpoint
3. API endpoint would be in `server/api/hardware/serial.post.ts`

## API Endpoints Reference

### RabbitMQ

- `POST /api/rabbitmq/publish` - Publish message
- `GET /api/health` - Health check

### Score Management

- `POST /api/score/quarter` - Update quarter
- `POST /api/score/update` - Update score
- `POST /api/score/foul` - Update fouls

### Hardware

- `POST /api/hardware/alarm` - Trigger alarm
- `GET /api/hardware/serial-ports` - List available ports
- `POST /api/hardware/serial-connect` - Connect to port

## Troubleshooting

### RabbitMQ Connection Fails

**Problem**: "Failed to connect to AMQP server"

**Solutions**:
1. Verify RabbitMQ Management Plugin is enabled: `rabbitmq-plugins enable rabbitmq_management`
2. Ensure Management HTTP API port (15672) is accessible
3. Check credentials in Cloudflare secrets
4. Test connectivity: `curl -u user:pass http://rabbitmq-host:15672/api/queues`

### Pages Deployment Shows Blank Page

**Problem**: Application doesn't load

**Solutions**:
1. Check Cloudflare Pages build logs
2. Verify `.output/public/` directory contains files: `ls -la .output/public/`
3. Ensure build command ran successfully
4. Check browser console for errors
5. Verify environment variables are set

### WebSerial API Not Available

**Problem**: Serial port features don't work

**Solutions**:
1. Only available on Chromium-based browsers with HTTPS
2. Localhost is allowed, deployed sites must use HTTPS
3. Check if device has USB ports
4. User must grant permission when first requesting port

### CORS Errors

**Problem**: API calls fail with CORS error

**Solutions**:
1. Ensure API routes return proper CORS headers
2. Check that requests go to same-origin (`/api/*`)
3. For external APIs, use server-side routes to proxy

## Performance Optimization

### CDN Caching

Cloudflare Pages automatically caches static assets. Configure cache headers:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ["/", "/controller", "/configuration"],
      crawlLinks: true, // Follow links for pre-rendering
    },
  },
});
```

### Data Serialization

Use Pinia store with Firebase for real-time data:

```typescript
// stores/game.ts
export const useGameStore = defineStore("game", () => {
  const { $firestore } = useNuxtApp();
  const gameData = reactive({ score: 0 });

  const updateScore = async (newScore: number) => {
    gameData.score = newScore;
    // Sync to Firestore for real-time updates
  };

  return { gameData, updateScore };
});
```

## Monitoring & Logs

### View Worker Logs

```bash
wrangler tail  # Real-time logs
```

### Check Pages Deployment

- Cloudflare Dashboard → Pages → select project
- View build logs and deployment history
- Check analytics and error logs

## Security Considerations

1. **Environment Secrets**: Never commit `.env.local`
2. **API Rate Limiting**: Consider adding with Cloudflare Workers
3. **HTTPS Only**: Cloudflare Pages uses HTTPS by default
4. **Firebase Rules**: Configure Firestore security rules
5. **RabbitMQ**: Use VPN or private networking if possible

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run wrangler:dev    # Start worker dev

# Building
npm run build           # Build for production

# Deployment
npm run deploy          # Deploy everything
npm run wrangler:deploy # Deploy only workers

# Testing
npm run lint
npm run test
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [WebSerial API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [RabbitMQ HTTP API Guide](https://www.rabbitmq.com/management-intro.html)

## Support

For issues or questions:
1. Check Cloudflare status page
2. Review application logs in Cloudflare Dashboard
3. Test RabbitMQ connectivity separately
4. Verify Firebase configuration

---

**Last Updated**: 2024-04-01
**Compatible With**: Nuxt 3.9+, Cloudflare Pages, Wrangler 3.28+
