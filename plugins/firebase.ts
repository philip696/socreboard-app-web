// Firebase v9+ uses a new modular syntax
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin(async () => {
  // Only initialize Firebase on client side with lazy imports
  if (process.client) {
    // Dynamically import Firebase only in browser
    const { initializeApp } = await import("firebase/app");
    const { getDatabase } = await import("firebase/database");
    const { getFirestore } = await import("firebase/firestore");
    
    const config = useRuntimeConfig();

    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      databaseURL: `https://${config.public.firebaseProjectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firestore
    const firestore = getFirestore(app);

    // Initialize Realtime Database
    const database = getDatabase(app);

    // Provide Firestore and Database to the app
    return {
      provide: {
        firestore,
        database,
      },
    };
  }
});
