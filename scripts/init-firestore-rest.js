#!/usr/bin/env node

/**
 * Firebase Firestore Initialization Script (REST API version)
 * Run this once to set up your Firestore database with the initial game state
 * 
 * Usage: node scripts/init-firestore-rest.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const apiKey = process.env.VITE_FIREBASE_API_KEY;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

// Validate config
if (!apiKey || !projectId) {
  console.error('❌ Missing Firebase configuration');
  console.error('Make sure .env.local exists with VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID');
  process.exit(1);
}

// Initial game state document (in Firestore JSON format)
const initialGameState = {
  fields: {
    quarter: { integerValue: '1' },
    timer: { integerValue: '0' },
    isRunning: { booleanValue: false },
    teamA: {
      mapValue: {
        fields: {
          name: { stringValue: 'Team A' },
          score: { integerValue: '0' },
          foul: { integerValue: '0' },
          timeout: { integerValue: '0' },
        },
      },
    },
    teamB: {
      mapValue: {
        fields: {
          name: { stringValue: 'Team B' },
          score: { integerValue: '0' },
          foul: { integerValue: '0' },
          timeout: { integerValue: '0' },
        },
      },
    },
    lastUpdated: { timestampValue: new Date().toISOString() },
    createdAt: { timestampValue: new Date().toISOString() },
  },
};

async function initializeFirestore() {
  try {
    console.log('🔥 Initializing Firestore database via REST API...');
    console.log('📝 Project ID:', projectId);

    // Firestore REST API endpoint
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/game_state/current?key=${apiKey}`;

    console.log('📤 Sending request to Firestore...');
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialGameState),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();

    console.log('✅ Successfully initialized Firestore!');
    console.log('\n📊 Created/updated document:');
    console.log('   Collection: game_state');
    console.log('   Document: current');
    console.log('\n📋 Initial game state:');
    console.log(JSON.stringify({
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
    }, null, 2));
    console.log('\n🎮 Ready to test locally!');
    console.log('   Navigate to: http://localhost:3000/controller');
    console.log('   Try updating a score and watch it sync to Firestore');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Firestore database is created in Firebase Console');
    console.error('2. Verify .env.local has correct Firebase credentials');
    console.error('3. Check that the API key is valid');
    process.exit(1);
  }
}

initializeFirestore();
