import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import CertificateForm from '../components/CertificateForm'
import CertificateFilters from '../components/CertificateFilters'
import CertificateGrid from '../components/CertificateGrid'
import DeleteModal from '../components/DeleteModal'
import type { Certificate, CertificateType, SemesterTerm } from '../lib/types'

export default function Certificates(){
  const { user } = useAuth()
  const [type, setType] = useState<CertificateType|'all'>('all')
  const [term, setTerm] = useState<SemesterTerm|'all'>('all')
  const [year, setYear] = useState<number|'all'>('all')
  const [q, setQ] = useState('')
  const [toDelete, setToDelete] = useState<Certificate | null>(null)

  const confirmDelete = async () => {
    if(!user || !toDelete) return
    try{
      await deleteDoc(doc(db, 'certificates', user.uid, 'items', toDelete.id))
    }catch(err){ console.error('Error deleting:', err) }
    setToDelete(null)
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#007A33]">Certificados</h1>
        <p className="text-sm text-slate-600">Registra, filtra y descarga tus certificados docentes.</p>
      </header>

      <CertificateForm />
      <CertificateFilters type={type} setType={setType} term={term} setTerm={setTerm} year={year} setYear={setYear} q={q} setQ={setQ} />
      <CertificateGrid type={type} term={term} year={year} q={q} onRequestDelete={(i)=>setToDelete(i)} />

      <DeleteModal open={!!toDelete} fileName={toDelete?.fileName || ''} onCancel={()=>setToDelete(null)} onConfirm={confirmDelete} />
    </section>
  )
}
