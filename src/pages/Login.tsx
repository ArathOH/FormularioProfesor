import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthBrand from '../components/AuthBrand'
import PasswordField from '../components/PasswordField'
import Alert from '../components/Alert'

function mapFirebaseError(code?: string){
  switch(code){
    case 'auth/invalid-email': return 'El correo no es válido.'
    case 'auth/user-not-found': return 'No existe una cuenta con ese correo.'
    case 'auth/wrong-password': return 'Contraseña incorrecta.'
    case 'auth/invalid-credential': return 'Credencial inválida.'
    case 'auth/too-many-requests': return 'Demasiados intentos. Intenta más tarde.'
    case 'auth/network-request-failed': return 'Fallo de red. Revisa tu conexión.'
    default: return 'No se pudo iniciar sesión. Intenta de nuevo.'
  }
}

export default function Login(){
  const nav = useNavigate()
  const loc = useLocation() as any
  const redirectTo = loc.state?.from?.pathname || '/'
  const { login, loginWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{kind:'error'|'success'|'info', text:string}|null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setMsg({kind:'error', text:'Ingresa un correo válido.'}); return
    }
    if(!email.endsWith('@uabc.edu.mx') && !email.endsWith('@uabc.mx')){
      setMsg({kind:'error', text:'Solo se permiten correos institucionales de UABC (@uabc.edu.mx o @uabc.mx).'}); return
    }
    if(pass.length < 6){
      setMsg({kind:'error', text:'La contraseña debe tener al menos 6 caracteres.'}); return
    }
    try{
      setLoading(true)
      await login(email, pass)
      setMsg({kind:'success', text:'¡Bienvenido! Redirigiendo…'})
      setTimeout(()=> nav(redirectTo, { replace: true }), 300)
    }catch(err:any){
      setMsg({kind:'error', text: mapFirebaseError(err?.code)})
    }finally{
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try{
      setLoading(true)
      setMsg(null)
      await loginWithGoogle()
      setMsg({kind:'success', text:'¡Bienvenido! Redirigiendo…'})
      setTimeout(()=> nav(redirectTo, { replace: true }), 300)
    }catch(err:any){
      setMsg({kind:'error', text: 'No se pudo iniciar sesión con Google. Intenta de nuevo.'})
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6">
        <div className="mb-6">
          <AuthBrand />
        </div>
        {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium">Correo institucional</label>
            <input id="email" type="email" autoComplete="email"
              value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
              placeholder="tu.correo@uabc.edu.mx"
            />
            <p className="text-xs text-slate-500">Solo correos @uabc.edu.mx o @uabc.mx</p>
          </div>
          <PasswordField id="password" label="Contraseña"
            autoComplete="current-password"
            value={pass} onChange={e=>setPass((e.target as HTMLInputElement).value)} />

          <div className="flex items-center justify-between text-sm">
            <Link to="/reset-password" className="underline text-[var(--uabc-green)] hover:text-[var(--uabc-ochre)]">Olvidé mi contraseña</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--uabc-ochre)] disabled:opacity-60"
          >{loading? 'Entrando…':'Entrar'}</button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">O continúa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="inline-flex items-center justify-center gap-3 rounded-xl px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading? 'Conectando…':'Continuar con Google'}
          </button>

          <div className="text-center text-sm mt-2">
            <span className="text-slate-600">¿No tienes cuenta? </span>
            <Link to="/register" className="underline text-[var(--uabc-green)] hover:text-[var(--uabc-ochre)]">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
