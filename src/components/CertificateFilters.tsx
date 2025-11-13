import { useMemo } from 'react'
import type { CertificateType, SemesterTerm } from '../lib/types'

const TYPES: { value: CertificateType; label: string }[] = [
  { value:'diplomado', label:'🎓 Diplomado' },
  { value:'curso-actualizacion', label:'📘 Curso' },
  { value:'taller-didactico', label:'🧩 Taller' },
  { value:'seminario-investigacion', label:'🔬 Seminario' },
  { value:'congreso', label:'🏛️ Congreso' },
  { value:'ponencia', label:'🗣️ Ponencia' },
  { value:'publicacion', label:'📰 Publicación' },
  { value:'certificacion-competencias', label:'✅ Competencias' },
  { value:'mooc', label:'💻 MOOC' },
  { value:'asesoria-tesis', label:'📑 Tesis' },
  { value:'reconocimiento-uabc', label:'🏅 Reconocimiento' },
  { value:'otro', label:'📝 Otro' },
]

export default function CertificateFilters({
  type, setType,
  term, setTerm,
  year, setYear,
  q, setQ
}:{
  type: CertificateType | 'all'; setType: (v: CertificateType | 'all')=>void
  term: SemesterTerm | 'all'; setTerm: (v: SemesterTerm | 'all')=>void
  year: number | 'all'; setYear: (v: number | 'all')=>void
  q: string; setQ: (s:string)=>void
}){
  const years = useMemo(()=>{
    const y = new Date().getFullYear(); const arr = [] as number[]
    for(let i=0;i<10;i++) arr.push(y - i)
    return arr
  },[])

  return (
    <div className="rounded-2xl border bg-white p-3 grid gap-3 md:grid-cols-4">
      <div className="grid gap-1">
        <label className="text-sm font-medium">Tipo</label>
        <select value={type} onChange={e=>setType(e.target.value as any)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
          <option value="all">Todos</option>
          {TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Semestre</label>
        <select value={term} onChange={e=>setTerm(e.target.value as any)} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
          <option value="all">Todos</option>
          <option value="ene-jun">Ene–Jun</option>
          <option value="jul-dic">Jul–Dic</option>
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Año</label>
        <select value={year} onChange={e=>setYear(e.target.value==='all'?'all': Number(e.target.value))} className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">
          <option value="all">Todos</option>
          {years.map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium">Buscar</label>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Título, descripción, emisor…" className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"/>
      </div>
    </div>
  )
}
