import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordField from '../components/PasswordField'
import Alert from '../components/Alert'
import LogoUABC from '../assets/LogoUABC.png'

function mapFirebaseError(code?: string){
  switch(code){
    case 'auth/invalid-email': return 'El correo no es válido.'
    case 'auth/email-already-in-use': return 'Ya existe una cuenta con ese correo.'
    case 'auth/weak-password': return 'La contraseña es muy débil. Usa al menos 6 caracteres.'
    case 'auth/operation-not-allowed': return 'Registro deshabilitado. Contacta al administrador.'
    case 'auth/network-request-failed': return 'Fallo de red. Revisa tu conexión.'
    default: return 'No se pudo crear la cuenta. Intenta de nuevo.'
  }
}

export default function Register(){
  const nav = useNavigate()
  const { register } = useAuth()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{kind:'error'|'success'|'info', text:string}|null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    
    if(!nombre.trim()){
      setMsg({kind:'error', text:'Ingresa tu nombre completo.'}); return
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setMsg({kind:'error', text:'Ingresa un correo válido.'}); return
    }
    if(!email.endsWith('@uabc.edu.mx') && !email.endsWith('@uabc.mx')){
      setMsg({kind:'error', text:'Solo se permiten correos institucionales de UABC (@uabc.edu.mx o @uabc.mx).'}); return
    }
    if(pass.length < 6){
      setMsg({kind:'error', text:'La contraseña debe tener al menos 6 caracteres.'}); return
    }
    if(pass !== confirmPass){
      setMsg({kind:'error', text:'Las contraseñas no coinciden.'}); return
    }
    
    try{
      setLoading(true)
      await register(email, pass, nombre)
      setMsg({kind:'success', text:'¡Cuenta creada! Redirigiendo…'})
      setTimeout(()=> nav('/', { replace: true }), 300)
    }catch(err:any){
      setMsg({kind:'error', text: mapFirebaseError(err?.code)})
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
            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-[#007A33] mb-2">
            Crear Cuenta
          </h1>
          <p className="text-sm text-gray-600">
            Regístrate con tu correo institucional UABC
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#007A33]/10 p-8">
          {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
          
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="nombre" className="text-sm font-semibold text-[#007A33] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nombre completo
              </label>
              <input 
                id="nombre" 
                type="text" 
                autoComplete="name"
                value={nombre} 
                onChange={e=>setNombre(e.target.value)}
                className="w-full rounded-xl border-2 border-[#007A33]/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CC8A00] focus:border-[#CC8A00] transition"
                placeholder="Juan Pérez García"
                required
              />
            </div>

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
                autoComplete="new-password"
                value={pass} 
                onChange={e=>setPass((e.target as HTMLInputElement).value)}
              />
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-[#007A33] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirmar contraseña
              </label>
              <PasswordField 
                id="confirm-password"
                autoComplete="new-password"
                value={confirmPass} 
                onChange={e=>setConfirmPass((e.target as HTMLInputElement).value)}
              />
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
                  Creando cuenta…
                </span>
              ) : 'Crear Cuenta'}
            </button>
          </form>

          <div className="text-center text-sm mt-6 pt-6 border-t border-gray-200">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link 
              to="/login" 
              className="text-[#007A33] hover:text-[#CC8A00] font-semibold transition"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Universidad Autónoma de Baja California</p>
        </div>
      </div>
    </div>
  )
}
