# Basketball Scoreboard App - Cloudflare Edition

## Introduction

This Basketball Scoreboard App is a modern web application built with **Nuxt 3** and **Vue 3**, deployed on **Cloudflare Pages** with backend support via **Cloudflare Workers**. It provides an intuitive real-time interface for tracking basketball scores, managing game timers, and coordinating team statistics.

**Previous Version**: This was originally a desktop application using Tauri. It has been fully migrated to web deployment on Cloudflare's edge network.

## Features

- ✅ **Real-time score tracking** for basketball games
- ✅ **Customizable team names** and team management
- ✅ **Game timer** with quarter management
- ✅ **Timeout tracking** with duration control
- ✅ **Foul management** per team
- ✅ **Multi-device support** - Controller, Display, and Configuration interfaces
- ✅ **WebSerial API support** for direct Arduino/hardware communication
- ✅ **RabbitMQ integration** for event broadcasting
- ✅ **Firebase real-time database** for data persistence
- ✅ **Cross-platform web deployment** - Works on any device with a modern browser
- ✅ **Responsive UI** - Desktop, tablet, and mobile support

## Tech Stack

### Frontend
- **Nuxt 3** - Vue 3 meta framework
- **Vue 3** - Progressive JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Firebase** - Real-time database

### Backend (Cloudflare)
- **Cloudflare Pages** - Static hosting with edge network
- **Cloudflare Workers** - Serverless API endpoints
- **RabbitMQ** - Message queue for event broadcasting

### Development
- **TypeScript** - Type-safe JavaScript
- **Vite** - Frontend build tool
- **Wrangler** - Cloudflare CLI tool

## Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Cloudflare Account** ([Sign up free](https://dash.cloudflare.com/sign-up))
- **Wrangler CLI** - For local development and deployment

```bash
npm install -g wrangler
wrangler login
```

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/basketball-scoreboard-app.git
   cd basketball-scoreboard-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration:
   ```env
   RABBITMQ_HOST=your-rabbitmq-host.com
   RABBITMQ_USERNAME=your-username
   RABBITMQ_PASSWORD=your-password
   VITE_FIREBASE_API_KEY=your-firebase-key
   # ... other Firebase configs
   ```

### Local Development

1. **Start Development Server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

2. **Start Workers Locally (Optional)**

   In a separate terminal:
   ```bash
   npm run wrangler:dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

## Deployment

### Deploy to Cloudflare Pages

#### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. Select "Connect a Git provider"
4. Choose your repository
5. Set build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `.output/public`
   - **Root directory**: `/`
6. Add environment variables in Cloudflare settings
7. Deploy!

#### Option 2: Deploy via Wrangler CLI

```bash
npm run deploy
```

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## Project Structure

```
├── components/              # Reusable Vue components
│   ├── team-controller.vue # Team control component
│   └── team-info.vue       # Team info display
├── composables/             # Reusable composition functions
│   ├── useEventBus.ts      # Cross-platform event handling
│   ├── useRabbitMQ.ts      # RabbitMQ messaging
│   └── useSerialPort.ts    # WebSerial API wrapper
├── pages/                   # Nuxt pages (routes)
│   ├── index.vue           # Main scoreboard display
│   ├── controller.vue      # Game controller
│   ├── configuration.vue   # App configuration
│   └── splashscreen.vue    # Splash screen
├── server/                  # Cloudflare Workers API routes
│   ├── worker.ts           # Main worker entry point
│   └── api/                # API route handlers
├── stores/                  # Pinia stores
│   └── game.ts             # Game state management
├── types/                   # TypeScript type definitions
├── assets/                  # Static assets (images, videos, fonts)
├── nuxt.config.ts          # Nuxt configuration
├── wrangler.toml           # Cloudflare Workers config
└── tailwind.config.js      # Tailwind CSS configuration
```

## Usage

### Main Views

1. **Scoreboard Display** (`/`)
   - Real-time score display
   - Team information
   - Timer and quarter display
   - Supported videos/animations

2. **Controller** (`/controller`)
   - Game control interface
   - Score adjustments
   - Timer controls
   - Timeout management

3. **Configuration** (`/configuration`)
   - Team setup
   - Event and field configuration
   - Hardware/serial port settings
   - Display URL configuration

### Game Flow

1. Access the app from multiple devices:
   - One device for the controller (typically iPad or tablet)
   - One or more devices for display (large screens, projectors)

2. Configure teams and settings from the configuration page

3. Use the controller to manage the game:
   - Start/stop timer
   - Update scores
   - Manage fouls and timeouts
   - Trigger announcements/animations

4. Real-time updates broadcast to all displays via RabbitMQ

## API Endpoints

### Score Management
- `POST /api/score/quarter` - Update quarter
- `POST /api/score/update` - Update team score
- `GET /api/score/state` - Get current game state

### RabbitMQ Integration
- `POST /api/rabbitmq/publish` - Publish event
- `GET /api/rabbitmq/config` - Get RabbitMQ config

### Health & Status
- `GET /api/health` - Health check endpoint

For full API documentation, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## Hardware Integration

### WebSerial API (Browser-based)

For direct JavaScript access to serially-connected devices (Arduino, etc.):

```typescript
import { useSerialPort } from '~/composables/useSerialPort';

export default {
  setup() {
    const serial = useSerialPort();
    
    return {
      async connectDevice() {
        if (serial.isWebSerialAvailable.value) {
          await serial.requestPort();
          await serial.connect({ baudRate: 9600 });
        }
      },
    };
  },
};
```

**Browser Support**: Chrome, Edge, Opera (Chromium-based browsers only)

### Server-Side Serial Control

For remote device access, use server API routes. Configure your hardware proxy service and call:

```typescript
const { publish } = useRabbitMQ();
await publish({
  routingKey: 'hardware.alarm.trigger',
  message: { duration: 5 },
});
```

## RabbitMQ Configuration

### Setup

1. Install and run RabbitMQ
2. Enable Management Plugin:
   ```bash
   rabbitmq-plugins enable rabbitmq_management
   ```
3. Access management interface: `http://localhost:15672`
4. Create users and exchanges as needed

### Verify Setup

```bash
curl -u guest:guest http://localhost:15672/api/status
```

## Troubleshooting

### Issue: App won't load after deployment

**Solution**:
1. Check Cloudflare Pages build logs
2. Verify environment variables are set in Cloudflare Dashboard
3. Ensure `.output/public/` contains build files
4. Check browser console for errors

### Issue: RabbitMQ connection fails

**Solution**:
1. Verify RabbitMQ is running: `sudo systemctl status rabbitmq-server`
2. Enable management plugin: `rabbitmq-plugins enable rabbitmq_management`
3. Check credentials and host in environment variables
4. Test connectivity: `curl -u user:pass http://host:15672/api/status`

### Issue: WebSerial API not available

**Solution**:
1. Ensure HTTPS (required for web serial access)
2. Use a Chromium-based browser (Chrome, Edge)
3. Verify device is connected via USB
4. Grant browser permissions when requested

For more troubleshooting, see [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

## Development Workflow

### Make Changes

1. Edit files in your preferred editor
2. Hot reload automatically updates your dev server (`npm run dev`)
3. Test changes in browser

### Testing

```bash
# Run tests (configure as needed)
npm run test

# Build production
npm run build

# Preview production build locally
npm run preview
```

### Deployment

1. Commit changes: `git commit -m "feat: add new feature"`
2. Push to GitHub: `git push origin main`
3. Cloudflare Pages automatically deploys on push!

Or manually deploy:

```bash
npm run deploy
```

## Performance Tips

- **Caching**: Cloudflare Pages automatically caches static assets
- **Optimization**: Images are optimized with `@nuxt/image`
- **Lazy Loading**: Components load on-demand
- **CDN**: All assets served from Cloudflare's global CDN

## Security

- ✅ **HTTPS Enforced**: All requests are encrypted
- ✅ **Environment Secrets**: Sensitive data stored in Cloudflare secrets (not in git)
- ✅ **Input Validation**: All API inputs validated server-side
- ✅ **Firebase Rules**: Configure Firestore security rules for data access
- ✅ **Rate Limiting**: Can be configured in Cloudflare settings

## Browser Support

- ✅ **Chrome** 89+
- ✅ **Firefox** 90+
- ✅ **Safari** 15+
- ✅ **Edge** 89+
- ✅ **Mobile Browsers** - iOS Safari, Chrome Android

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m 'Add amazing-feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Migration Guide

If you're migrating from the desktop Tauri version to this web version, see [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for detailed steps and reference information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 Email: support@example.com
- 🐛 Report Issues: [GitHub Issues](https://github.com/yourusername/basketball-scoreboard-app/issues)
- 📚 Documentation: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## Resources

- [Nuxt Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [WebSerial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Firebase Documentation](https://firebase.google.com/docs)

## Changelog

### v2.0.0 (Cloudflare Edition)
- ✨ Migrated from Tauri desktop to Cloudflare Pages
- ✨ Added Cloudflare Workers for backend API
- ✨ Integrated WebSerial API for hardware access
- ✨ Switched to Nuxt 3 with SSR support
- 🔄 Refactored event system for web compatibility
- 🔄 Updated all dependencies to latest versions
- 🐛 Fixed various compatibility issues

### v1.0.0 (Tauri Desktop)
- Original desktop application

---

**Last Updated**: 2024-04-01
**Deployment Platform**: Cloudflare Pages & Workers
**Framework**: Nuxt 3
   ```bash
   npm install
3. Run the application in development mode
   ```bash
   cargo tauri dev
4. Build the application to binary application:
   ```bash
   cargo tauri build
