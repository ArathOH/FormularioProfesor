import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthBrand from '../components/AuthBrand'
import Alert from '../components/Alert'

export default function ResetPassword(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState<{kind:'error'|'success'|'info', text:string}|null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setMsg({kind:'error', text:'Ingresa un correo válido.'}); return
    }
    // Simulated password reset (no backend available)
    setSent(true)
    setMsg({kind:'info', text:'⚠️ Recuperación de contraseña no disponible. Esta es una app solo frontend. Contacta al administrador para restablecer tu cuenta.'})
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6">
        <div className="mb-6"><AuthBrand /></div>
        {msg && <div className="mb-4"><Alert kind={msg.kind} message={msg.text}/></div>}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium">Correo</label>
            <input id="email" type="email" autoComplete="email"
              value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
              placeholder="tu.correo@uabc.mx"
            />
          </div>
          <button type="submit" className="mt-2 rounded-xl px-4 py-2 bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--uabc-ochre)]">
            Enviar enlace
          </button>
          {sent && (
            <p className="text-sm">¿Listo? <Link to="/login" className="underline text-[var(--uabc-green)] hover:text-[var(--uabc-ochre)]">Volver a iniciar sesión</Link></p>
          )}
        </form>
      </div>
    </div>
  )
}
