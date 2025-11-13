import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordField from '../components/PasswordField'
import Alert from '../components/Alert'
import LogoUABC from '../assets/LogoUABC.png'

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
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-[#007A33]/5 via-white to-[#CC8A00]/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título centrados */}
        <div className="text-center mb-8">
          <img 
            src={LogoUABC} 
            alt="Logo UABC" 
            className="w-32 h-32 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold text-[#007A33] mb-2">
            Mis Certificados UABC
          </h1>
          <p className="text-sm text-gray-600">
            Sistema de Gestión de Certificados Académicos
          </p>
          <p className="text-xs text-[#CC8A00] font-semibold mt-2 bg-[#CC8A00]/10 inline-block px-3 py-1 rounded-full">
            Versión 1.0
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#007A33]/10 p-8">
          {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
          
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-[#007A33] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Correo institucional
              </label>
              <input 
                id="email" 
                type="email" 
                autoComplete="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-[#007A33]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CC8A00] focus:border-[#CC8A00] transition"
                placeholder="tu.correo@uabc.edu.mx"
                required
              />
              <p className="text-xs text-gray-500">
                Solo correos @uabc.edu.mx o @uabc.mx
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[#007A33] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña
              </label>
              <PasswordField 
                id="password"
                autoComplete="current-password"
                value={pass} 
                onChange={e=>setPass((e.target as HTMLInputElement).value)}
              />
            </div>

            <div className="flex items-center justify-end">
              <Link 
                to="/reset-password" 
                className="text-sm text-[#007A33] hover:text-[#CC8A00] font-medium transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl px-4 py-3 bg-[#007A33] text-white font-semibold hover:bg-[#CC8A00] transition-all focus:outline-none focus:ring-4 focus:ring-[#007A33]/30 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Entrando…
                </span>
              ) : 'Iniciar Sesión'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3 border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Conectando…' : 'Google'}
            </button>
          </form>

          <div className="text-center text-sm mt-6 pt-6 border-t border-gray-200">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link 
              to="/register" 
              className="text-[#007A33] hover:text-[#CC8A00] font-semibold transition"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Universidad Autónoma de Baja California</p>
          <p className="mt-1">© 2025 Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}
