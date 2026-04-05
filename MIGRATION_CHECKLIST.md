# Cloudflare Migration Checklist

This document tracks the migration of the Basketball Scoreboard app from Tauri Desktop to Cloudflare Pages & Workers.

## ✅ Completed Migrations

### Package & Configuration
- [x] Removed `@tauri-apps/api` and `@tauri-apps/plugin-dialog` dependencies
- [x] Added `@cloudflare/workers-types` and `wrangler` for Cloudflare
- [x] Updated `nuxt.config.ts` to enable SSR and Cloudflare Pages preset
- [x] Created `wrangler.toml` for Workers configuration
- [x] Updated runtime config for environment variables

### Plugins & Utilities
- [x] Updated `plugins/firebase.ts` to use runtime config (removed hardcoded credentials)
- [x] Disabled desktop-only plugins (`disable-refresh.ts`, `disable-right-click.ts`)
- [x] Created `composables/useEventBus.ts` (cross-platform event handling)
- [x] Created `composables/useRabbitMQ.ts` (message publishing)
- [x] Created `composables/useSerialPort.ts` (WebSerial API wrapper)

### Server-Side API Routes
- [x] Created `server/worker.ts` (main Worker entry point)
- [x] Created `server/api/rabbitmq/publish.post.ts` (RabbitMQ integration)
- [x] Created `server/api/health.get.ts` (health check endpoint)

### Documentation
- [x] Created `CLOUDFLARE_DEPLOYMENT.md` (comprehensive deployment guide)
- [x] Created `.env.example` (environment variable template)
- [x] Updated `.gitignore` (added Cloudflare-specific entries)

## ⚠️ Requires Updates

### Vue Components - Pages
**Status**: ⚠️ Needs refactoring

These files use Tauri API calls (`invoke`, `listen`, `emit`) and need to be updated:
- `pages/index.vue` - Main scoreboard display
- `pages/controller.vue` - Game controller interface
- `pages/configuration.vue` - Configuration page
- `pages/splashscreen.vue` - Splash screen (if still needed)

**Changes needed**:
1. Replace `@tauri-apps/api` imports with `useEventBus()` composable
2. Replace `invoke()` calls with API endpoints or `useRabbitMQ()`
3. Replace direct event listeners with `useEventBus().on()`
4. Remove `data-tauri-drag-region` attributes from templates
5. Update fullscreen toggle to use web APIs (`requestFullscreen()`)

**Reference for updating pages**:
```typescript
// OLD (Tauri)
import { invoke, listen } from '@tauri-apps/api/tauri';
await listen('quarter_event', (event) => { ... });
await invoke('update_quarter', { quarter: 1 });

// NEW (Web)
const { on, invoke } = useEventBus();
on('quarter_event', (payload) => { ... });
await invoke('update_quarter', { quarter: 1 });
```

### Vue Components - Reusable
- `components/team-controller.vue` - May use Tauri APIs
- `components/team-info.vue` - Likely OK, but verify

### TypeScript Types
- `types/PlayerInfo.d.ts` - Verify compatibility
- `types/TeamInfo.d.ts` - Verify compatibility

### Tauri-Specific Files
**Status**: ✅ Can be deleted or archived
- `src-tauri/` directory - No longer needed for web deployment
- `src-tauri/Cargo.toml` - Tauri Rust backend
- `src-tauri/tauri.conf.json` - Tauri configuration

**Recommendation**: Keep in git history, create `tauri-desktop/` archive branch for reference

## 🔄 Migration Steps

### Step 1: Verify Environment Setup
```bash
# Install dependencies
npm install

# Create .env.local from template
cp .env.example .env.local

# Fill in your actual values
# RABBITMQ_HOST, FIREBASE credentials, etc.
```

### Step 2: Update Vue Components (In Order)
1. **pages/configuration.vue** (least complex) - Update first
2. **pages/controller.vue** (medium complexity) - Update second
3. **pages/index.vue** (most complex) - Update last
4. **components/*.vue** - Update as needed

### Step 3: Test Locally
```bash
npm run dev
# Test all functionality without Tauri
```

### Step 4: Configure RabbitMQ
- Verify RabbitMQ Management Plugin is enabled
- Port 15672 (management) is accessible
- Test with: `curl -u user:pass http://host:15672/api/status`

### Step 5: Deploy to Cloudflare
```bash
# Build
npm run build

# Deploy to Pages + Workers
npm run deploy
```

## 📋 Component-by-Component Notes

### pages/index.vue
**Tauri Listeners Used**:
- `start_timer_event` → Use `useEventBus().on()`
- `stop_timer_event` → Use `useEventBus().on()`
- `start_timeout_event` → Use `useEventBus().on()`
- `stop_timeout_event` → Use `useEventBus().on()`
- `quarter_event`, `quarter_step_event` → Use `useEventBus().on()`
- `show_banner`, `hide_banner` → Use `useEventBus().on()`
- `3point_event`, `and_one_event` → Use `useEventBus().on()`
- `score_step_event` → Use `useEventBus().on()`

**Tauri Invokes Used**:
- `update_quarter` → Call `/api/score/quarter` or emit event to controller
- Complex logic should move to server routes

**Fullscreen**:
- `toggleFullscreen()` → Use `document.documentElement.requestFullscreen()`

### pages/controller.vue
**Tauri Usage**:
- `emitEvent()` calls → Use `useEventBus().emit()`
- `toggleFullscreen()` → Use web API
- `closeApp()` → Redirect to home or logout
- Timer logic → Move to composable

**Refactor Strategy**:
1. Extract timer logic to `composables/useGameTimer.ts`
2. Replace all `emitEvent()` with `useEventBus().emit()`
3. Replace fullscreen with web API
4. Update team score updates to use Pinia store

### pages/configuration.vue
**Status**: Likely needs serial port configuration updates
- Remove Tauri serial API calls
- Add WebSerial or server-side serial control options

## 🔐 Security Considerations

- [x] Don't commit `.env.local` (in .gitignore)
- [ ] Set Cloudflare secrets for sensitive data
- [ ] Configure Firestore security rules
- [ ] Use HTTPS only (automatic with Cloudflare)
- [ ] Implement rate limiting for API endpoints
- [ ] Validate all user inputs on server side

## 📊 Testing Checklist

### Functional Testing
- [ ] Timer starts/stops correctly
- [ ] Quarter increments/decrements
- [ ] Score updates work
- [ ] Timeout functionality works
- [ ] Banner display works
- [ ] Video playback works (3-point, and-one)
- [ ] Team configuration saves
- [ ] All controllers can communicate

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance Testing
- [ ] Page load time < 3s
- [ ] Timer runs smoothly (60 FPS)
- [ ] API responses < 200ms
- [ ] No memory leaks in dev tools

### Hardware Testing (if applicable)
- [ ] WebSerial API works on compatible devices
- [ ] Arduino communication works
- [ ] Alarm triggering works
- [ ] RabbitMQ message publishing works

## 📱 Platform-Specific Notes

### macOS
- WebSerial API available in Chrome/Edge
- May need USB device permissions

### Windows
- WebSerial API available in Chrome/Edge
- COM port availability depends on device

### Linux
- WebSerial API available in Chrome/Edge/Chromium
- Serial device permissions via `udev` rules

### iOS/Android
- WebSerial NOT available
- Must use server-side serial proxy
- Alternative: Use native apps instead

## 🚀 Deployment Options

### Option A: Cloudflare Pages (Recommended)
- Free tier available
- Automatic DNS propagation
- Integrated with Cloudflare Workers
- Easy GitHub integration

### Option B: Traditional Hosting
- Use Nuxt API routes on any Node.js server
- Deploy separately from Workers
- More complex setup

### Option C: Hybrid
- Pages for frontend
- External server for Workers (if needed)
- Firebase for realtime data

## 📝 Known Issues & Limitations

1. **WebSerial API**: Only works on Chromium-based browsers and HTTPS
2. **Serial Ports**: Can't access devices from remote users without proxy
3. **Real-time Updates**: Need WebSocket or polling for multi-client sync
4. **Offline Mode**: Not available on Pages (must be online)
5. **File System**: Can't access local files like desktop app could

## 🆘 Troubleshooting

### RabbitMQ Connection Issues
```bash
# Test RabbitMQ connectivity
curl -v -u guest:guest http://localhost:15672/api/status

# Enable management plugin if not already enabled
sudo rabbitmq-plugins enable rabbitmq_management

# Restart RabbitMQ
sudo systemctl restart rabbitmq-server
```

### Cloudflare Deployment Fails
- Check build logs in Cloudflare Dashboard
- Verify `npm run build` succeeds locally
- Ensure all environment variables are set in Cloudflare secrets
- Check `.output/public/` directory exists and has files

### WebSerial Port Not Appearing
- Verify device is plugged in
- Check browser console for permissions errors
- Try a different USB cable or port
- Update device drivers (Windows)

## 📞 Next Steps

1. Review completed changes
2. Update remaining Vue components
3. Test locally with `npm run dev`
4. Set up Cloudflare account if not done
5. Configure environment variables
6. Deploy to production
7. Test all functionality end-to-end

## 📚 References

- [Nuxt 3 Documentation](https://nuxt.com/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [WebSerial API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)

---

**Last Updated**: 2024-04-01
**Migration Status**: 60% Complete (foundation done, component updates needed)
