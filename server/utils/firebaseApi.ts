/**
 * Firebase REST API helper for server-side operations in Cloudflare Workers
 * Used by server API endpoints to interact with Firestore and Realtime Database
 */

interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  authDomain: string;
  databaseURL: string;
}

/**
 * Initialize Firebase REST API client with credentials from environment
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  const config = useRuntimeConfig();
  
  return {
    apiKey: config.firebaseApiKey || process.env.FIREBASE_API_KEY || '',
    projectId: config.firebaseProjectId || process.env.FIREBASE_PROJECT_ID || '',
    authDomain: config.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN || '',
    databaseURL: `https://${config.firebaseProjectId || process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`
  };
};

/**
 * Call Firestore REST API
 * @param method HTTP method (GET, POST, PATCH, DELETE)
 * @param path Firestore document path (e.g., "game_state/current")
 * @param data Request body data
 */
export const callFirestore = async (
  method: string,
  path: string,
  data?: any
): Promise<any> => {
  const config = getFirebaseConfig();
  
  if (!config.projectId || !config.apiKey) {
    throw new Error('Firebase credentials not configured');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${path}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify({
      fields: convertToFirestore(data)
    });
  }

  try {
    const response = await $fetch(url, options);
    return response;
  } catch (error) {
    console.error(`Firestore API error [${method} ${path}]:`, error);
    throw error;
  }
};

/**
 * Call Realtime Database REST API
 * @param path Database path
 * @param method HTTP method
 * @param data Request body data
 */
export const callRealtimeDatabase = async (
  path: string,
  method: string = 'GET',
  data?: any
): Promise<any> => {
  const config = getFirebaseConfig();
  
  if (!config.projectId || !config.apiKey) {
    throw new Error('Firebase credentials not configured');
  }

  const url = `${config.databaseURL}/${path}.json?auth=${config.apiKey}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await $fetch(url, options);
    return response;
  } catch (error) {
    console.error(`Realtime Database API error [${method} ${path}]:`, error);
    throw error;
  }
};

/**
 * Convert JavaScript values to Firestore JSON format
 */
function convertToFirestore(obj: any): any {
  if (obj === null) {
    return { nullValue: null };
  }
  
  if (typeof obj === 'string') {
    return { stringValue: obj };
  }
  
  if (typeof obj === 'number') {
    return Number.isInteger(obj) 
      ? { integerValue: obj.toString() }
      : { doubleValue: obj };
  }
  
  if (typeof obj === 'boolean') {
    return { booleanValue: obj };
  }
  
  if (Array.isArray(obj)) {
    return {
      arrayValue: {
        values: obj.map(v => ({ mapValue: { fields: convertToFirestore(v) } }))
      }
    };
  }
  
  if (typeof obj === 'object') {
    const fields: any = {};
    for (const key in obj) {
      fields[key] = convertToFirestore(obj[key]);
    }
    return { mapValue: { fields } };
  }
  
  return {};
}

/**
 * Update game state in Firestore
 */
export const updateGameState = async (data: any): Promise<void> => {
  await callFirestore('PATCH', 'game_state/current', {
    ...data,
    lastUpdated: new Date().toISOString()
  });
};

/**
 * Get game state from Firestore
 */
export const getGameState = async (): Promise<any> => {
  const response = await callFirestore('GET', 'game_state/current');
  return response;
};

/**
 * Update score in Realtime Database
 */
export const updateScoreRealtimeDB = async (team: string, score: number): Promise<void> => {
  await callRealtimeDatabase(`game/teams/${team}`, 'PATCH', {
    score,
    updatedAt: new Date().getTime()
  });
};
