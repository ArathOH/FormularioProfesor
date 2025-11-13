import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addDoc, collection, serverTimestamp, setDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UploadCategory } from '../lib/types'

const MAX_MB = 1 // Reducido para caber en Firestore (1MB)
const ALLOWED = [
  'image/jpeg','image/png','image/webp','image/gif',
  'application/pdf'
]

// Convertir archivo a Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UploadDropzone(){
  const { user } = useAuth()
  const [isOver, setIsOver] = useState(false)
  const [asCert, setAsCert] = useState<UploadCategory>('general')
  const inputRef = useRef<HTMLInputElement>(null)
  const [queue, setQueue] = useState<{ name:string; progress:number; status:'uploading'|'done'|'error'; error?:string }[]>([])

  const borderCls = useMemo(() => (
    isOver ? 'border-[#CC8A00] bg-amber-50/40' : 'border-slate-300 hover:border-[#CC8A00] bg-white'
  ), [isOver])

  const onFiles = useCallback((files: FileList | null) => {
    if(!user || !files?.length) return
    const arr = Array.from(files)
    arr.forEach(async (file) => {
      if(!ALLOWED.includes(file.type)){
        setQueue(q=>[...q,{name:file.name, progress:0, status:'error', error:'Tipo no permitido'}]);
        return
      }
      if(file.size > MAX_MB*1024*1024){
        setQueue(q=>[...q,{name:file.name, progress:0, status:'error', error:`Excede ${MAX_MB}MB`}]);
        return
      }

      setQueue(q=>[...q,{name:file.name, progress:0, status:'uploading'}])

      try {
        // 1. Convert file to Base64
        setQueue(q=> q.map(it => it.name===file.name? {...it, progress:50} : it))
        const base64Data = await fileToBase64(file)
        
        // 2. Save to Firestore with Base64 data
        const meta = {
          name: file.name,
          data: base64Data, // Base64 string (includes data:image/png;base64,...)
          size: file.size,
          contentType: file.type,
          category: asCert,
          userId: user.uid,
          createdAt: serverTimestamp(),
        }
        
        setQueue(q=> q.map(it => it.name===file.name? {...it, progress:75} : it))
        
        const col = collection(db, 'uploads', user.uid, 'items')
        const docRef = await addDoc(col, meta)
        await setDoc(doc(db, 'uploads', user.uid, 'items', docRef.id), { id: docRef.id }, { merge: true })

        setQueue(q=> q.map(it => it.name===file.name? {...it, status:'done', progress:100} : it))
      } catch (err) {
        console.error('Upload error:', err)
        setQueue(q=> q.map(it => it.name===file.name? {...it, status:'error', error: 'Error al subir'} : it))
      }
    })
  }, [user, asCert])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsOver(false)
    onFiles(e.dataTransfer.files)
  }

  if(!user) return null

  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="cat" className="font-medium">Tipo:</label>
          <select id="cat" value={asCert} onChange={e=>setAsCert(e.target.value as UploadCategory)} className="rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#CC8A00]">
            <option value="general">General</option>
            <option value="certificate">Certificado</option>
          </select>
        </div>
        <div className="text-xs text-slate-500">Max {MAX_MB}MB · JPG/PNG/WebP/GIF/PDF</div>
      </div>

      <div
        onDragEnter={(e)=>{e.preventDefault(); setIsOver(true)}}
        onDragOver={(e)=>{e.preventDefault(); setIsOver(true)}}
        onDragLeave={(e)=>{e.preventDefault(); setIsOver(false)}}
        onDrop={onDrop}
        className={`rounded-2xl border-2 ${borderCls} p-6 transition-colors`}
      >
        <div className="grid place-items-center gap-3 text-center">
          <div className="h-16 w-16 rounded-full grid place-items-center bg-[#007A33]/10">
            <svg className="h-7 w-7 text-[#007A33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4m0 0l-4 4m4-4l4 4"/><path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"/></svg>
          </div>
          <p className="text-sm">Arrastra y suelta archivos aquí</p>
          <div>
            <button onClick={()=>inputRef.current?.click()} className="rounded-xl bg-[#007A33] text-white px-4 py-2 hover:bg-[#CC8A00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CC8A00]">Seleccionar archivos</button>
            <input ref={inputRef} type="file" multiple hidden onChange={(e)=>onFiles(e.target.files)} />
          </div>
        </div>
      </div>

      {queue.length>0 && (
        <div className="grid gap-2">
          {queue.map((f,i)=> (
            <div key={i} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <p className="font-medium truncate">{f.name}</p>
                  <p className="text-xs text-slate-500">{f.status === 'uploading' ? 'Subiendo…' : f.status === 'done' ? 'Completado' : f.error}</p>
                </div>
                <span className="text-sm tabular-nums w-12 text-right">{f.progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-slate-200 overflow-hidden">
                <div className="h-2 rounded bg-gradient-to-r from-[#007A33] via-[#CC8A00] to-[#007A33] animate-[progress_1.5s_ease_infinite]" style={{ width: `${Math.max(8,f.progress)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes progress { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
      `}</style>
    </section>
  )
}
