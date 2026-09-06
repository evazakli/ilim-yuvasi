import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// Helper to parse pasted Firebase JavaScript snippets or JSON directly
export function parseFirebaseSnippet(input: string): Partial<FirebaseConfigParams> {
  const result: Partial<FirebaseConfigParams> = {};
  const keys: (keyof FirebaseConfigParams)[] = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
  ];

  for (const key of keys) {
    const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
    const match = input.match(regex);
    if (match && match[1]) {
      result[key] = match[1].trim();
    }
  }

  // If databaseURL was not explicitly in the snippet, derive it from projectId
  if (!result.databaseURL && result.projectId) {
    result.databaseURL = `https://${result.projectId}-default-rtdb.firebaseio.com`;
  }

  return result;
}

export const getStoredFirebaseConfig = (): FirebaseConfigParams => {
  try {
    const saved = localStorage.getItem('custom_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };
};

export const saveCustomFirebaseConfig = (cfg: FirebaseConfigParams) => {
  localStorage.setItem('custom_firebase_config', JSON.stringify(cfg));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('custom_firebase_config');
  window.location.reload();
};

const activeConfig = getStoredFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  activeConfig.apiKey &&
  activeConfig.projectId &&
  activeConfig.apiKey.trim() !== '' &&
  activeConfig.apiKey !== 'YOUR_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let rtdb: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Initialize Realtime Database with explicit or derived URL
    try {
      const rtdbUrl = activeConfig.databaseURL || `https://${activeConfig.projectId}-default-rtdb.firebaseio.com`;
      rtdb = getDatabase(app, rtdbUrl);
    } catch (rtdbErr) {
      console.warn('[Firebase] Realtime Database başlatılamadı, Firestore ve yerel mod kullanılacak:', rtdbErr);
    }

    console.info('[Firebase] İlim Yuvası başarıyla Firebase bulutuna bağlandı! 🔥');
  } catch (error) {
    console.warn('[Firebase] Başlatma hatası, yerel moda geçildi:', error);
  }
} else {
  console.info('[Firebase] Henüz yapılandırma girilmedi. Yerel & Çoklu-Sekme (BroadcastChannel) modunda çalışılıyor.');
}

export { app, auth, firestore, rtdb };
