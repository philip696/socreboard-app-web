/**
 * Firebase Firestore Initialization Script
 * Run this once to set up your Firestore database with the initial game state
 * 
 * Usage: node scripts/init-firestore.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingKeys.join(', '));
  console.error('\nMake sure .env.local exists with all Firebase credentials');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial game state document
const initialGameState = {
  quarter: 1,
  timer: 0,
  isRunning: false,
  teamA: {
    name: 'Team A',
    score: 0,
    foul: 0,
    timeout: 0,
  },
  teamB: {
    name: 'Team B',
    score: 0,
    foul: 0,
    timeout: 0,
  },
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

async function initializeFirestore() {
  try {
    console.log('🔥 Initializing Firestore database...');
    console.log('📝 Project ID:', firebaseConfig.projectId);

    // Create/update the game_state/current document
    const gameStateRef = doc(db, 'game_state', 'current');
    await setDoc(gameStateRef, initialGameState);

    console.log('✅ Successfully initialized Firestore!');
    console.log('\n📊 Created document:');
    console.log('   Collection: game_state');
    console.log('   Document: current');
    console.log('\n📋 Initial game state:');
    console.log(JSON.stringify(initialGameState, null, 2));
    console.log('\n🎮 Ready to test locally!');
    console.log('   Navigate to: http://localhost:3000/controller');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Firestore database is created in Firebase Console');
    console.error('2. Check that security rules allow writes');
    console.error('3. Verify .env.local has correct Firebase credentials');
    process.exit(1);
  }
}

initializeFirestore();
