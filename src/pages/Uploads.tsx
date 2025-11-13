import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import UploadDropzone from '../components/UploadDropzone'
import FileGrid, { type FileView } from '../components/FileGrid'
import DeleteModal from '../components/DeleteModal'
import type { UploadItem } from '../lib/types'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Uploads(){
  const [view, setView] = useState<FileView>('all')
  const [q, setQ] = useState('')
  const [toDelete, setToDelete] = useState<UploadItem | null>(null)
  const { user } = useAuth()

  const tabs: {key:FileView; label:string}[] = [
    { key:'all', label:'Todos' },
    { key:'certificate', label:'Certificados' },
    { key:'images', label:'Imágenes' },
    { key:'pdfs', label:'PDFs' },
  ]

  const confirmDelete = async () => {
    if(!user || !toDelete) return
    try{
      // Remove from Firestore (file stays in Cloudinary)
      await deleteDoc(doc(db, 'uploads', user.uid, 'items', toDelete.id))
    }catch(err){
      console.error('Error deleting:', err)
    }
    setToDelete(null)
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tus archivos</h1>
          <p className="text-sm text-slate-600">Sube y gestiona tus documentos. Usa filtros para ver certificados, imágenes o PDFs.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-64 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC8A00]"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setView(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm border ${view===t.key? 'bg-[#007A33] text-white border-[#007A33]' : 'bg-white hover:border-[#CC8A00]'}`}
          >{t.label}</button>
        ))}
      </div>

      <UploadDropzone />

      <FileGrid view={view} q={q} onRequestDelete={(it)=>setToDelete(it)} />

      <DeleteModal
        open={!!toDelete}
        fileName={toDelete?.name || ''}
        onCancel={()=>setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}
