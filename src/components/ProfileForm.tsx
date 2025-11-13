import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile, UserRole } from '../lib/types'
import AvatarB64Uploader from './AvatarB64Uploader'
import Alert from './Alert'

const PHONE_RE = /^(\+?52)?\s?\d{10}$/ // simplificada para MX

export default function ProfileForm(){
  const { user } = useAuth()
  const [form, setForm] = useState<UserProfile>({ nombre: '', telefono: '', bio: '', role: 'estudiante' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{kind:'error'|'success'|'info', text:string}|null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return }
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setForm({ ...(snap.data() as UserProfile) })
      setLoading(false)
    }
    load()
  }, [user])

  const canSave = useMemo(() => {
    if(!form?.nombre || form.nombre.trim().length < 2) return false
    if(form.telefono && !PHONE_RE.test(form.telefono.replaceAll(/\s|-/g,''))) return false
    return true
  }, [form])

  const save = async () => {
    if (!user || !canSave) return
    setSaving(true); setMsg(null)
    try{
      await setDoc(doc(db, 'users', user.uid), {
        ...form,
        email: user.email || undefined,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setMsg({kind:'success', text:'Perfil guardado correctamente.'})
    }catch{
      setMsg({kind:'error', text:'No se pudo guardar el perfil.'})
    }finally{ setSaving(false) }
  }

  if (loading) return <div className="p-4 text-sm text-slate-600">Cargando…</div>

  return (
    <form onSubmit={(e)=>{e.preventDefault(); save()}} className="grid gap-5">
      {msg && <Alert kind={msg.kind} message={msg.text} />}

      <section className="rounded-2xl border bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Datos generales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="nombre" className="text-sm font-medium">Nombre completo</label>
            <input id="nombre" value={form.nombre || ''} onChange={e=>setForm(f=>({...f, nombre:e.target.value}))}
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Nombre y apellidos"/>
          </div>

          <div className="grid gap-1">
            <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
            <input id="telefono" inputMode="tel" placeholder="10 dígitos"
              value={form.telefono || ''}
              onChange={e=>setForm(f=>({...f, telefono:e.target.value}))}
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"/>
            {form.telefono && !PHONE_RE.test(form.telefono.replaceAll(/\s|-/g,'')) && (
              <p className="text-xs text-red-600">Formato esperado: 10 dígitos (puede incluir +52)</p>
            )}
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
            <textarea id="bio" rows={3} placeholder="Cuéntanos sobre ti…"
              value={form.bio || ''}
              onChange={e=>setForm(f=>({...f, bio:e.target.value}))}
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"/>
          </div>

          <div className="grid gap-1">
            <label htmlFor="role" className="text-sm font-medium">Rol</label>
            <select id="role" value={form.role || 'estudiante'}
              onChange={e=>setForm(f=>({...f, role: e.target.value as UserRole}))}
              className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="invitado">Invitado</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Correo</label>
            <input readOnly value={user?.email || ''} className="rounded-xl border px-3 py-2 bg-slate-50"/>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Foto de perfil</h2>
        <AvatarB64Uploader value={form.avatarB64} onChange={(b64)=>setForm(f=>({...f, avatarB64: b64}))} />
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={!canSave || saving}
          className="inline-flex items-center rounded-xl bg-(--uabc-green) text-white px-5 py-2.5 hover:bg-(--uabc-ochre) disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--uabc-ochre)">
          {saving? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={()=>window.location.reload()} className="rounded-xl border px-5 py-2.5 hover:border-(--uabc-ochre)">Cancelar</button>
      </div>
    </form>
  )
}
