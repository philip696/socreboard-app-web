# Quick Start Guide - Cloudflare Deployment

## What Changed?

Your Basketball Scoreboard app has been migrated from **Tauri Desktop** to **Cloudflare Pages & Workers**. It now runs entirely on the web!

### Key Differences

| Feature | Before (Tauri) | After (Cloudflare) |
|---------|---|---|
| **Deployment** | Desktop app installer | Web app on Cloudflare |
| **Backend** | Rust backend (Tauri) | Cloudflare Workers |
| **Hardware** | Direct serial access | WebSerial API or proxy |
| **Updates** | Manual/Native updater | Auto-deploy from GitHub |
| **Access** | Local machine only | Browser from anywhere |
| **Scaling** | Single machine | Global CDN |

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values (RabbitMQ, Firebase, etc.)
```

### 3. Run Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Deploy to Cloudflare (Production)

**Option A - GitHub Integration (Easiest)**
1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect your GitHub repo
4. Build settings auto-configured
5. Done! Auto-deploys on every push

**Option B - CLI Deploy**
```bash
npm run build
npm run deploy
```

## File Structure Overview

```
✅ Ready for deployment:
- pages/                    # Main Vue pages
- components/               # Reusable Vue components
- composables/              # New: useEventBus, useRabbitMQ, useSerialPort
- server/                   # New: API routes for Workers
- stores/                   # New: Pinia game state store
- plugins/firebase.ts       # Updated: Environment variables

⚠️ Needs updating (Vue components):
- pages/index.vue          # Replace Tauri API calls
- pages/controller.vue     # Replace Tauri API calls
- pages/configuration.vue  # Update as needed

📚 Documentation:
- CLOUDFLARE_DEPLOYMENT.md # Complete deployment guide
- MIGRATION_CHECKLIST.md   # Detailed migration steps
```

## What I've Already Done

### ✅ Configuration Files Updated
- `package.json` - Removed Tauri, added Cloudflare packages
- `nuxt.config.ts` - Enabled SSR, added Cloudflare preset
- `wrangler.toml` - Workers configuration
- `.env.example` - Environment variable template
- `.gitignore` - Added Cloudflare-specific entries

### ✅ New Server-Side Code Created
- `server/worker.ts` - Main worker entry point
- `server/api/rabbitmq/publish.post.ts` - RabbitMQ integration
- `server/api/score/quarter.post.ts` - Score endpoints
- `server/api/score/update.post.ts` - Score update
- `server/api/health.get.ts` - Health check

### ✅ New Composables Created
- `composables/useEventBus.ts` - Cross-platform event handling
- `composables/useRabbitMQ.ts` - Message publishing
- `composables/useSerialPort.ts` - WebSerial API wrapper

### ✅ New Store Created
- `stores/game.ts` - Complete game state management

### ✅ Plugins Updated
- `plugins/firebase.ts` - Now uses environment variables
- `plugins/disable-refresh.ts` - Disabled (not needed for web)
- `plugins/disable-right-click.ts` - Disabled (not needed for web)

### ✅ Documentation Created
- `CLOUDFLARE_DEPLOYMENT.md` - Complete deployment guide
- `MIGRATION_CHECKLIST.md` - Step-by-step migration checklist
- `README.md` - Updated project overview
- This file! - Quick start guide

## ⚠️ What Still Needs Work

The Vue component pages need to be updated to remove Tauri-specific code:

### pages/index.vue (Main Scoreboard)
**Changes needed**:
- Replace `@tauri-apps/api` imports with `useEventBus()`
- Update `await listen(...)` calls
- Replace `invoke()` calls with API endpoints
- Remove `data-tauri-drag-region` attributes
- Update fullscreen toggle to use web API

**Before**:
```typescript
import { invoke, listen } from '@tauri-apps/api/tauri';
await listen('quarter_event', (event) => { ... });
await invoke('update_quarter', { quarter: 1 });
```

**After**:
```typescript
const { on, invoke } = useEventBus();
on('quarter_event', (payload) => { ... });
await invoke('update_quarter', { quarter: 1 });
```

### pages/controller.vue (Game Controller)
Similar updates needed - replace all Tauri API calls with web equivalents.

### pages/configuration.vue (Settings)
Update as needed, focus on removing any Tauri-specific code.

## Testing Changes Locally

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test in Browser
- Open http://localhost:3000
- Check all pages load correctly
- Verify no console errors

### 3. Check Build
```bash
npm run build
npm run preview
```

Should look the same after building.

## Deployment Checklist

Before deploying to production:

- [ ] All pages updated (index, controller, configuration)
- [ ] Local testing passed (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] `.env.local` contains all required values
- [ ] Cloudflare secrets configured (if using GitHub integration)
- [ ] RabbitMQ host is accessible
- [ ] Firebase config is correct
- [ ] All links/assets work in build preview

## Key Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run wrangler:dev    # Start workers dev server

# Production
npm run build           # Build for production
npm run preview         # Preview production build locally

# Deployment
npm run deploy          # Deploy everything to Cloudflare

# Utilities
npm run postinstall    # Prepare Nuxt
```

## RabbitMQ Setup (If Needed)

```bash
# Install RabbitMQ (macOS)
brew install rabbitmq

# Start RabbitMQ
brew services start rabbitmq-server

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Access admin panel
# http://localhost:15672 (guest/guest)
```

## Firefox Dev Tools Tips

1. Press F12 to open Developer Tools
2. Go to "Network" tab to see API calls
3. Go to "Console" to see error messages
4. Go to "Sources" to debug Vue components

## Common Issues & Solutions

### "Cannot find module '@tauri-apps/api'"
- Don't worry, this is expected! Just use the new composables instead
- Use `useEventBus()` instead of importing `@tauri-apps/api`

### "Deploy failed: .output/public not found"
- Run `npm run build` first
- Check that build completed successfully
- Verify `.output/public/` directory exists

### "RabbitMQ connection failed"
- Check RabbitMQ is running
- Verify host in `.env.local`
- Enable management plugin: `rabbitmq-plugins enable rabbitmq_management`

### "WebSerial API not available"
- Only works on Chromium-based browsers (Chrome, Edge)
- Must use HTTPS (localhost is OK for dev)
- User must grant USB permission

## Getting Help

1. **Read the docs**:
   - `CLOUDFLARE_DEPLOYMENT.md` - Full deployment guide
   - `MIGRATION_CHECKLIST.md` - Detailed steps

2. **Check the new composables**:
   - `composables/useEventBus.ts` - Event handling
   - `composables/useRabbitMQ.ts` - RabbitMQ usage
   - `composables/useSerialPort.ts` - Hardware access

3. **Review the example store**:
   - `stores/game.ts` - Game state management

## Next Steps

1. ✅ Review this guide
2. ⚠️ Update the Vue component pages (follow examples in composables)
3. ✅ Test locally with `npm run dev`
4. ✅ Deploy to Cloudflare (GitHub integration or CLI)
5. ✅ Verify everything works in production
6. 🎉 Celebrate - you've successfully migrated to the cloud!

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Nuxt 3 Docs](https://nuxt.com/)
- [Vue 3 Docs](https://vuejs.org/)
- [WebSerial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)

---

**Need help?** Check the docs or review the example code in the new composables and stores!

**Good luck! 🚀**
