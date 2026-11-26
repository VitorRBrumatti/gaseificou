import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function isGoogleAuthReady(): boolean {
  return getFirebaseAuth() !== null
}

export function subscribeAuth(listener: (user: AuthUser | null) => void): () => void {
  const auth = getFirebaseAuth()
  if (!auth) {
    listener(null)
    return () => {}
  }

  return onAuthStateChanged(auth, (user) => {
    listener(user ? toAuthUser(user) : null)
  })
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const auth = requireAuth()
  const result = await signInWithPopup(auth, googleProvider)
  return toAuthUser(result.user)
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const auth = requireAuth()
  const result = await signInWithEmailAndPassword(auth, email.trim(), password)
  return toAuthUser(result.user)
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<AuthUser> {
  const auth = requireAuth()
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const displayName = name.trim()
  if (displayName) await updateProfile(result.user, { displayName })
  return toAuthUser(result.user)
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = requireAuth()
  await sendPasswordResetEmail(auth, email.trim())
}

export async function signOutGoogle(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) return
  await signOut(auth)
}

export type AuthFlow = 'google' | 'email' | 'register' | 'reset'

export function authErrorMessage(error: unknown, flow: AuthFlow = 'google'): string {
  if (error instanceof Error && error.message === 'FIREBASE_AUTH_UNCONFIGURED') {
    return 'O login ainda não está configurado neste ambiente.'
  }

  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return ''
  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.'
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Este endereço ainda não está autorizado para login. Inclua o domínio em Authentication no Firebase.'
  }
  if (code === 'auth/operation-not-allowed') {
    return flow === 'google'
      ? 'O provedor Google ainda não foi ativado no projeto Firebase.'
      : 'O cadastro por e-mail ainda não foi ativado no projeto Firebase.'
  }
  if (code === 'auth/invalid-email') return 'Esse e-mail não é válido.'
  if (code === 'auth/email-already-in-use') return 'Já existe uma conta com esse e-mail.'
  if (code === 'auth/weak-password') return 'A senha precisa ter pelo menos 6 caracteres.'
  if (code === 'auth/user-not-found') return 'Não encontramos uma conta com esse e-mail.'
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'E-mail ou senha não conferem.'
  if (code === 'auth/user-disabled') return 'Esta conta foi desativada.'
  if (code === 'auth/too-many-requests') return 'Muitas tentativas. Espere um pouco e tente de novo.'
  if (flow === 'register') return 'Não foi possível criar a conta. Tente de novo.'
  if (flow === 'reset') return 'Não foi possível enviar o link de redefinição. Tente de novo.'
  if (flow === 'email') return 'Não foi possível entrar. Tente de novo.'
  return 'Não foi possível entrar com o Google. Tente de novo.'
}

function requireAuth() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('FIREBASE_AUTH_UNCONFIGURED')
  return auth
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}
