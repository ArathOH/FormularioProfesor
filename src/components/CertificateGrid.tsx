import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Certificate, CertificateType, SemesterTerm } from '../lib/types'
import CertificateCard from './CertificateCard'

export default function CertificateGrid({ type, term, year, q, onRequestDelete }:{
  type: CertificateType | 'all'
  term: SemesterTerm | 'all'
  year: number | 'all'
  q: string
  onRequestDelete: (i: Certificate)=>void
}){
  const { user } = useAuth()
  const [items, setItems] = useState<Certificate[]>([])

  useEffect(() => {
    if (!user) return
    const col = collection(db, 'certificates', user.uid, 'items')
    const qy = query(col, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(qy, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Certificate[]
      setItems(data)
    })
    return () => unsub()
  }, [user])

  const filtered = useMemo(() => {
    const termText = q.trim().toLowerCase()
    return items.filter(it => {
      const byType = type === 'all' ? true : it.type === type
      const byTerm = term === 'all' ? true : it.semesterTerm === term
      const byYear = year === 'all' ? true : it.year === year
      const byText = termText ? (
        (it.title?.toLowerCase().includes(termText)) ||
        (it.description?.toLowerCase().includes(termText)) ||
        (it.issuer?.toLowerCase().includes(termText))
      ) : true
      return byType && byTerm && byYear && byText
    })
  }, [items, type, term, year, q])

  if(!user) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map(it => (
        <CertificateCard key={it.id} item={it} onRequestDelete={onRequestDelete} />
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-sm text-slate-500">No hay certificados para mostrar.</div>
      )}
    </div>
  )
}
