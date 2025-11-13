import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UploadItem } from '../lib/types'
import FileCard from './FileCard'

export type FileView = 'all'|'certificate'|'images'|'pdfs'

export default function FileGrid({ view, q, onRequestDelete }:{ view: FileView; q: string; onRequestDelete: (item: UploadItem)=>void }){
  const { user } = useAuth()
  const [items, setItems] = useState<UploadItem[]>([])

  useEffect(() => {
    if (!user) return
    
    // Real-time listener from Firestore (filtered by user)
    const col = collection(db, 'uploads', user.uid, 'items')
    const qy = query(col, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(qy, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as UploadItem[]
      setItems(data)
    })
    return () => unsub()
  }, [user])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter(it => {
      const byText = term ? it.name.toLowerCase().includes(term) : true
      let byView = true
      if(view==='certificate') byView = it.category === 'certificate'
      else if(view==='images') byView = it.contentType?.startsWith('image/')
      else if(view==='pdfs') byView = it.contentType === 'application/pdf'
      return byText && byView
    })
  }, [items, q, view])

  if (!user) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((it) => (
        <FileCard key={it.id} item={it} onRequestDelete={onRequestDelete} />
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-sm text-slate-500">No hay archivos para mostrar.</div>
      )}
    </div>
  )
}
