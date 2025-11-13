import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthBrand from '../components/AuthBrand'
import PasswordField from '../components/PasswordField'
import Alert from '../components/Alert'

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
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6">
        <div className="mb-6">
          <AuthBrand />
          <p className="text-sm text-slate-600 mt-2">Crea tu cuenta para comenzar.</p>
        </div>
        {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="nombre" className="text-sm font-medium">Nombre completo</label>
            <input id="nombre" type="text" autoComplete="name"
              value={nombre} onChange={e=>setNombre(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
              placeholder="Juan Pérez García"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium">Correo institucional UABC</label>
            <input id="email" type="email" autoComplete="email"
              value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
              placeholder="tu.correo@uabc.edu.mx"
            />
            <p className="text-xs text-slate-500">Solo correos @uabc.edu.mx o @uabc.mx</p>
          </div>
          
          <PasswordField id="password" label="Contraseña"
            autoComplete="new-password"
            value={pass} onChange={e=>setPass((e.target as HTMLInputElement).value)} />

          <PasswordField id="confirm-password" label="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmPass} onChange={e=>setConfirmPass((e.target as HTMLInputElement).value)} />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--uabc-ochre)] disabled:opacity-60"
          >{loading? 'Creando cuenta…':'Registrarse'}</button>

          <div className="text-center text-sm mt-2">
            <span className="text-slate-600">¿Ya tienes cuenta? </span>
            <Link to="/login" className="underline text-[var(--uabc-green)] hover:text-[var(--uabc-ochre)]">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
