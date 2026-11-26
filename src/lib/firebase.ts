import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let attempted = false

function readConfig(): FirebaseOptions | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim()

  if (!apiKey || !projectId || !appId) return null

  const config: FirebaseOptions = { apiKey, projectId, appId }
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim()
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim()

  if (authDomain) config.authDomain = authDomain
  if (storageBucket) config.storageBucket = storageBucket
  if (messagingSenderId) config.messagingSenderId = messagingSenderId

  return config
}

function ensureFirebase(): Firestore | null {
  if (attempted) return db
  attempted = true

  const config = readConfig()
  if (!config) return null

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config)
    db = getFirestore(app)
    auth = config.authDomain ? getAuth(app) : null
    return db
  } catch (error) {
    console.warn('[Gaseificou] Firebase indisponível. O app segue no modo local.', error)
    app = null
    db = null
    auth = null
    return null
  }
}

export function isFirebaseConfigured(): boolean {
  return ensureFirebase() !== null
}

export function getFirebaseApp(): FirebaseApp | null {
  ensureFirebase()
  return app
}

export function getFirestoreDb(): Firestore | null {
  ensureFirebase()
  return db
}

export function getFirebaseAuth(): Auth | null {
  ensureFirebase()
  return auth
}
