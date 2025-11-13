import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'
import Alert from '../components/Alert'
import LogoUABC from '../assets/LogoUABC.png'

export default function ResetPassword(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
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
    
    try{
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setSent(true)
      setMsg({kind:'success', text:'✅ Correo enviado. Revisa tu bandeja de entrada (y spam) para restablecer tu contraseña.'})
    }catch(err:any){
      if(err?.code === 'auth/user-not-found'){
        setMsg({kind:'error', text:'No existe una cuenta con ese correo.'})
      }else if(err?.code === 'auth/invalid-email'){
        setMsg({kind:'error', text:'El correo no es válido.'})
      }else{
        setMsg({kind:'error', text:'No se pudo enviar el correo. Intenta de nuevo.'})
      }
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-[#007A33]/5 via-white to-[#CC8A00]/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <img 
            src={LogoUABC} 
            alt="Logo UABC" 
            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-[#007A33] mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-gray-600">
            Ingresa tu correo institucional UABC
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#007A33]/10 p-8">
          {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
          
          {!sent ? (
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
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
                  Te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl px-4 py-3 bg-[#007A33] text-white font-semibold hover:bg-[#CC8A00] transition-all focus:outline-none focus:ring-4 focus:ring-[#007A33]/30 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Enviando…
                  </span>
                ) : 'Enviar enlace de recuperación'}
              </button>

              <div className="text-center text-sm mt-4 pt-4 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="text-[#007A33] hover:text-[#CC8A00] font-semibold transition inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#007A33]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#007A33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#007A33] mb-2">¡Correo enviado!</h2>
              <p className="text-sm text-gray-600 mb-6">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <Link 
                to="/login" 
                className="inline-block w-full rounded-xl px-4 py-3 bg-[#007A33] text-white font-semibold hover:bg-[#CC8A00] transition-all shadow-md hover:shadow-lg"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Universidad Autónoma de Baja California</p>
        </div>
      </div>
    </div>
  )
}
