import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, provider, db } from '../lib/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import type { UserRole } from '../lib/types'

interface AuthCtx {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Obtener el rol del usuario desde Firestore
        try {
          const docSnap = await getDoc(doc(db, 'users', u.uid))
          if (docSnap.exists()) {
            const data = docSnap.data()
            setUserRole(data.role || 'invitado')
          } else {
            setUserRole('invitado')
          }
        } catch (err) {
          console.error('Error al obtener rol del usuario:', err)
          setUserRole('invitado')
        }
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = userCredential.user
    
    await updateProfile(newUser, { displayName: name })
    
    await setDoc(doc(db, 'users', newUser.uid), {
      nombre: name,
      email: email,
      updatedAt: serverTimestamp(),
    })
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    // Validar que el correo sea de dominio UABC
    const email = user.email || ''
    if (!email.endsWith('@uabc.edu.mx') && !email.endsWith('@uabc.mx')) {
      // Eliminar el usuario recién creado
      await user.delete()
      throw new Error('Solo se permiten correos institucionales de UABC (@uabc.edu.mx o @uabc.mx)')
    }
    
    // Guardar datos del usuario de Google en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      nombre: user.displayName || '',
      email: user.email || '',
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
