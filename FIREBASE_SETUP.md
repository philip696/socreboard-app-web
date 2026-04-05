# Firebase Integration with Cloudflare Workers

This guide explains how to connect your Basketball Scoreboard app to Firebase through Cloudflare Workers.

## Prerequisites

- Firebase project created (https://console.firebase.google.com)
- Wrangler CLI installed (`npm install -g @cloudflare/wrangler`)
- Cloudflare account with Workers enabled

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Find your web app and click the config icon
6. Copy these values from the config object:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

Example config you'll see:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDot-0fDndkYXa9N3QJwvrzwWQxcN3lwdg",
  authDomain: "sportkit-167c0.firebaseapp.com",
  projectId: "sportkit-167c0",
  storageBucket: "sportkit-167c0.appspot.com",
  messagingSenderId: "71493237069",
  appId: "1:71493237069:web:8e5f2c1e3d4f5a6b7c"
};
```

## Step 2: Set Cloudflare Secrets

Store your Firebase credentials as Cloudflare secrets (never commit them to git):

```bash
# From your project root directory
wrangler secret put FIREBASE_API_KEY
# Paste: AIzaSyDot-0fDndkYXa9N3QJwvrzwWQxcN3lwdg

wrangler secret put FIREBASE_AUTH_DOMAIN
# Paste: sportkit-167c0.firebaseapp.com

wrangler secret put FIREBASE_PROJECT_ID
# Paste: sportkit-167c0

wrangler secret put FIREBASE_STORAGE_BUCKET
# Paste: sportkit-167c0.appspot.com

wrangler secret put FIREBASE_MESSAGING_SENDER_ID
# Paste: 71493237069

wrangler secret put FIREBASE_APP_ID
# Paste: 1:71493237069:web:8e5f2c1e3d4f5a6b7c
```

**Note:** Each `wrangler secret put` command will prompt you to enter the value interactively.

## Step 3: Create Firestore Collections

Your app expects these Firestore collections:

### 1. `game_state` collection
```json
{
  "current": {
    "quarter": 1,
    "teamA": {
      "name": "Team A",
      "score": 0,
      "foul": 0,
      "timeout": 0
    },
    "teamB": {
      "name": "Team B",
      "score": 0,
      "foul": 0,
      "timeout": 0
    },
    "timer": 0,
    "lastUpdated": "2026-04-05T10:00:00Z"
  }
}
```

### 2. Create in Firebase console:
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose your region
5. Click **Create**

## Step 4: Set Up Firestore Security Rules

Replace the default security rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reads and writes from Cloudflare Workers
    match /game_state/{document=**} {
      allow read, write: if request.auth != null || true;
    }
    
    // Optional: More restrictive rules for production
    // match /game_state/current {
    //   allow read: if true;
    //   allow write: if request.auth.uid != null;
    // }
  }
}
```

## Step 5: Update Environment Variables (Local Development)

Create `.env.local` for local development:

```env
# Frontend (public, prefixed with VITE_)
VITE_FIREBASE_API_KEY=AIzaSyDot-0fDndkYXa9N3QJwvrzwWQxcN3lwdg
VITE_FIREBASE_AUTH_DOMAIN=sportkit-167c0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sportkit-167c0
VITE_FIREBASE_STORAGE_BUCKET=sportkit-167c0.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=71493237069
VITE_FIREBASE_APP_ID=1:71493237069:web:8e5f2c1e3d4f5a6b7c

# Backend (from wrangler secrets, optional for local dev)
FIREBASE_API_KEY=AIzaSyDot-0fDndkYXa9N3QJwvrzwWQxcN3lwdg
FIREBASE_PROJECT_ID=sportkit-167c0
```

## Step 6: Test the Connection

### Local Development
```bash
npm run dev
# Navigate to http://localhost:3000/controller
# Try updating a score - it should save to Firebase
```

### View in Firebase Console
1. Go to **Firestore Database**
2. Open the `game_state/current` document
3. You should see updates in real-time

## Step 7: Deploy to Cloudflare

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist/

# Or use the Wrangler CLI for Workers deployment
wrangler publish
```

## Troubleshooting

### "Firebase credentials not configured"
- Run `wrangler secret list` to verify secrets are set
- Check that secret names match exactly (case-sensitive)

### "Firestore API error"
- Ensure Firestore database is created in Firebase console
- Check Firestore security rules allow access
- Verify `FIREBASE_PROJECT_ID` is correct

### "Cannot read VITE_ variables"
- Make sure `.env.local` exists in project root
- Restart dev server after changing `.env.local`: `npm run dev`
- Variables must be prefixed with `VITE_` to be available in frontend

### Local dev works, but production fails
- Run `wrangler secret list` to confirm secrets are in production environment
- Secrets added during development may not be in production
- You may need to re-add secrets with `--env production` flag:
  ```bash
  wrangler secret put FIREBASE_API_KEY --env production
  ```

## API Endpoints Using Firebase

### Update Score
```bash
POST /api/score/update
Content-Type: application/json

{
  "teamId": "teamA",
  "scorePoints": 25,
  "action": "set"
}
```

### Update Quarter
```bash
POST /api/score/quarter
Content-Type: application/json

{
  "quarter": 2
}
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   Browser (Nuxt Frontend)                   │
│  - Vue Components                           │
│  - Firebase Realtime Listeners              │
└────────────┬────────────────────────────────┘
             │
             │ HTTP REST API
             ↓
┌─────────────────────────────────────────────┐
│   Cloudflare Workers (Nitro Server)         │
│  - API Routes: /api/score/*                 │
│  - Firebase REST API Integration            │
│  - RabbitMQ Publishing                      │
└────────────┬────────────────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────────┐  ┌──────────────────┐
│  Firebase   │  │  RabbitMQ        │
│  Firestore  │  │  (Real-time)     │
└─────────────┘  └──────────────────┘
```

## Next Steps

1. ✅ Set up Firebase with Cloudflare
2. ✅ Configure Firestore collections
3. ✅ Add security rules
4. Test the app locally
5. Deploy to Cloudflare Pages
6. Monitor performance in Cloudflare dashboard

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
