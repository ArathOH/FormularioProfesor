import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ALLOWED, MAX_MB, fileToBase64, fmtBytes } from '../lib/file'
import type { CertificateType, DepartmentType, SemesterTerm } from '../lib/types'

const TYPES: { value: CertificateType; label: string }[] = [
  { value:'diplomado', label:'🎓 Diplomado' },
  { value:'curso-actualizacion', label:'📘 Curso de actualización' },
  { value:'taller-didactico', label:'🧩 Taller didáctico' },
  { value:'seminario-investigacion', label:'🔬 Seminario de investigación' },
  { value:'congreso', label:'🏛️ Congreso/Simposio' },
  { value:'ponencia', label:'🗣️ Ponencia/Cartel' },
  { value:'publicacion', label:'📰 Publicación' },
  { value:'certificacion-competencias', label:'✅ Certificación de competencias' },
  { value:'mooc', label:'💻 Curso en línea (MOOC)' },
  { value:'asesoria-tesis', label:'📑 Asesoría/Comité de tesis' },
  { value:'reconocimiento-uabc', label:'🏅 Reconocimiento UABC' },
  { value:'otro', label:'📝 Otro' },
]

const DEPARTMENTS: { value: DepartmentType; label: string }[] = [
  { value: 'ciencias-educacion', label: 'Ciencias de la Educación' },
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'humanidades', label: 'Humanidades' },
  { value: 'ciencias-salud', label: 'Ciencias de la Salud' },
  { value: 'artes', label: 'Artes' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'administracion', label: 'Administración' },
  { value: 'economia', label: 'Economía' },
  { value: 'juridicas', label: 'Jurídicas' },
  { value: 'otro', label: 'Otro' },
]

export default function CertificateForm(){
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<CertificateType>('curso-actualizacion')
  const [typeOther, setTypeOther] = useState('')
  const [department, setDepartment] = useState<DepartmentType>('ciencias-educacion')
  const [departmentOther, setDepartmentOther] = useState('')
  const [description, setDescription] = useState('')
  const [issuer, setIssuer] = useState('')
  const [modality, setModality] = useState<'presencial'|'en-linea'|'mixta'|''>('')
  const [hours, setHours] = useState<number|''>('')
  const [semesterTerm, setSemesterTerm] = useState<SemesterTerm>('ene-jun')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [issuedOn, setIssuedOn] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [b64, setB64] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [err, setErr] = useState<string|null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const canSubmit = useMemo(() => {
    if(!user) return false
    if(!title.trim()) return false
    if(type==='otro' && !typeOther.trim()) return false
    if(department==='otro' && (!departmentOther.trim() || departmentOther.trim().length < 3)) return false
    if(!file || !b64) return false
    if(hours !== '' && (typeof hours !== 'number' || hours <= 0)) return false
    return true
  }, [user, title, type, typeOther, department, departmentOther, file, b64, hours])

  const onPick = () => inputRef.current?.click()

  const onFile = async (f?: File) => {
    setErr(null); setProgress(0); setB64(''); setFile(null)
    if(!f) return
    if(!ALLOWED.includes(f.type)) { setErr('Formato no permitido.'); return }
    if(f.size > MAX_MB*1024*1024) { setErr(`Máximo ${MAX_MB} MB. Actual: ${fmtBytes(f.size)}`); return }
    setFile(f)
    // Simular progreso (Base64 no da progreso real)
    setProgress(25)
    const data = await fileToBase64(f)
    setProgress(70)
    setB64(data)
    setProgress(100)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if(!user || !canSubmit || !file) return
    try{
      const meta: Record<string, any> = {
        title: title.trim(),
        type,
        department,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        data: b64,
        semesterTerm,
        year,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      // Solo agregar campos opcionales si tienen valor
      if (type === 'otro' && typeOther.trim()) meta.typeOther = typeOther.trim()
      if (department === 'otro' && departmentOther.trim()) meta.departmentOther = departmentOther.trim()
      if (description.trim()) meta.description = description.trim()
      if (issuer.trim()) meta.issuer = issuer.trim()
      if (modality) meta.modality = modality
      if (hours !== '' && hours > 0) meta.hours = hours
      if (issuedOn) meta.issuedOn = issuedOn
      
      const col = collection(db, 'certificates', user.uid, 'items')
      const ref = await addDoc(col, meta)
      await setDoc(doc(db, 'certificates', user.uid, 'items', ref.id), { id: ref.id }, { merge: true })
      // reset
      setTitle(''); setType('curso-actualizacion'); setTypeOther(''); setDepartment('ciencias-educacion'); setDepartmentOther(''); setDescription(''); setIssuer(''); setModality(''); setHours(''); setSemesterTerm('ene-jun'); setYear(new Date().getFullYear()); setIssuedOn(''); setFile(null); setB64(''); setProgress(0)
      alert('Certificado guardado ✅')
    }catch(error){
      console.error('Error al guardar certificado:', error)
      setErr('No se pudo guardar. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-4 sm:p-6 grid gap-4">
      <h2 className="text-lg font-semibold">Registrar certificado</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="title" className="text-sm font-medium">Título *</label>
          <input id="title" value={title} onChange={e=>setTitle(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Ej. Diplomado en Didáctica"/>
        </div>

        <div className="grid gap-1">
          <label htmlFor="type" className="text-sm font-medium">Tipo *</label>
          <select id="type" value={type} onChange={e=>setType(e.target.value as CertificateType)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
            {TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {type==='otro' && (
          <div className="grid gap-1 sm:col-span-2">
            <label htmlFor="typeOther" className="text-sm font-medium">Describe el tipo</label>
            <input id="typeOther" value={typeOther} onChange={e=>setTypeOther(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Ej. Certificado de…"/>
          </div>
        )}

        <div className="grid gap-1">
          <label htmlFor="department" className="text-sm font-medium">Departamento *</label>
          <select id="department" value={department} onChange={e=>setDepartment(e.target.value as DepartmentType)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
            {DEPARTMENTS.map(d=> <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {department==='otro' && (
          <div className="grid gap-1">
            <label htmlFor="departmentOther" className="text-sm font-medium">Especifica el departamento</label>
            <input id="departmentOther" value={departmentOther} onChange={e=>setDepartmentOther(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Mínimo 3 caracteres"/>
          </div>
        )}

        <div className="grid gap-1 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">Descripción</label>
          <textarea id="description" rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Contenido, competencias, alcance…"/>
        </div>

        <div className="grid gap-1">
          <label htmlFor="issuer" className="text-sm font-medium">Emisor / Institución</label>
          <input id="issuer" value={issuer} onChange={e=>setIssuer(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Ej. UABC, SEP, CONOCER"/>
        </div>

        <div className="grid gap-1">
          <label htmlFor="modality" className="text-sm font-medium">Modalidad</label>
          <select id="modality" value={modality} onChange={e=>setModality(e.target.value as any)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
            <option value="">Seleccionar…</option>
            <option value="presencial">Presencial</option>
            <option value="en-linea">En línea</option>
            <option value="mixta">Mixta</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="hours" className="text-sm font-medium">Horas</label>
          <input id="hours" type="number" min={1} value={hours} onChange={e=>setHours(e.target.value? Number(e.target.value):'')} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)" placeholder="Ej. 40"/>
        </div>

        <div className="grid gap-1">
          <label htmlFor="term" className="text-sm font-medium">Semestre *</label>
          <select id="term" value={semesterTerm} onChange={e=>setSemesterTerm(e.target.value as SemesterTerm)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
            <option value="ene-jun">Ene–Jun</option>
            <option value="jul-dic">Jul–Dic</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="year" className="text-sm font-medium">Año *</label>
          <input id="year" type="number" min={2000} max={2100} value={year} onChange={e=>setYear(Number(e.target.value||new Date().getFullYear()))} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"/>
        </div>

        <div className="grid gap-1">
          <label htmlFor="issuedOn" className="text-sm font-medium">Fecha de emisión</label>
          <input id="issuedOn" type="date" value={issuedOn} onChange={e=>setIssuedOn(e.target.value)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"/>
        </div>

        <div className="grid gap-1 sm:col-span-2">
          <label className="text-sm font-medium">Archivo (PDF/Imagen) ≤ {MAX_MB}MB *</label>
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                {file ? (<>
                  <span className="font-medium">{file.name}</span> · {file.type} · {fmtBytes(file.size)}
                </>) : 'Selecciona un archivo PDF o imagen.'}
              </div>
              <div>
                <button type="button" onClick={onPick} className="rounded-xl bg-[#007A33] text-white px-4 py-2 hover:bg-[#CC8A00] focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">Elegir archivo</button>
                <input ref={inputRef} type="file" accept={ALLOWED.join(',')} hidden onChange={(e)=>onFile(e.target.files?.[0])}/>
              </div>
            </div>
            {file && (
              <div className="mt-3">
                <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
                  <div className="h-2 rounded bg-gradient-to-r from-[#007A33] via-[#CC8A00] to-[#007A33] animate-[progress_1.4s_ease_infinite]" style={{ width: `${Math.max(8,progress)}%` }} />
                </div>
              </div>
            )}
            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={!canSubmit} className="rounded-xl bg-[#007A33] text-white px-5 py-2.5 hover:bg-[#CC8A00] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--uabc-ochre)">Guardar certificado</button>
      </div>

      <style>{`@keyframes progress { 0%{filter:hue-rotate(0)} 100%{filter:hue-rotate(360deg)} }`}</style>
    </form>
  )
}
