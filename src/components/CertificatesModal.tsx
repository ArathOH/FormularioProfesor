import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Certificate, UserWithCertificates, SemesterTerm } from '../lib/types'

interface Props {
  user: UserWithCertificates
  onClose: () => void
}

export default function CertificatesModal({ user, onClose }: Props) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    semestre: 'all' as 'all' | SemesterTerm,
    sortBy: 'date-desc' as 'date-desc' | 'date-asc' | 'title',
  })

  useEffect(() => {
    checkAdminStatus()
    loadCertificates()
  }, [user.uid])

  const checkAdminStatus = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()
      setIsAdmin(userData?.role === 'admin')
    } catch (err) {
      console.error('Error verificando rol admin:', err)
      setIsAdmin(false)
    }
  }

  const loadCertificates = async () => {
    try {
      console.log('🔍 Buscando certificados para usuario:', user.uid)
      
      const snap = await getDocs(collection(db, 'certificates', user.uid, 'items'))
      console.log('📄 Certificados encontrados:', snap.size)
      
      const data = snap.docs.map((d) => {
        const docData = d.data()
        console.log('📝 Certificado:', d.id, docData)
        return { id: d.id, ...docData }
      }) as Certificate[]
      
      // Ordenar por fecha descendente en JavaScript
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0
        return dateB - dateA
      })
      
      console.log('✅ Certificados cargados:', data.length)
      setCertificates(data)
    } catch (err) {
      console.error('❌ Error loading certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (certId: string) => {
    if (!isAdmin) return
    if (!confirm('¿Estás seguro de eliminar este certificado?')) return
    
    setDeletingId(certId)
    try {
      await deleteDoc(doc(db, 'certificates', user.uid, 'items', certId))
      setCertificates(prev => prev.filter(c => c.id !== certId))
      console.log('✅ Certificado eliminado:', certId)
    } catch (err) {
      console.error('❌ Error al eliminar certificado:', err)
      alert('No se pudo eliminar el certificado')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredCertificates = certificates
    .filter((cert) => {
      const matchesSearch = !filters.search || 
        cert.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        cert.fileName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        cert.description?.toLowerCase().includes(filters.search.toLowerCase())
      const matchesSemestre = filters.semestre === 'all' || cert.semesterTerm === filters.semestre
      return matchesSearch && matchesSemestre
    })
    .sort((a, b) => {
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title)
      const dateA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0
      if (filters.sortBy === 'date-asc') return dateA - dateB
      return dateB - dateA
    })

  console.log('📊 Total certificados:', certificates.length)
  console.log('🔍 Certificados filtrados:', filteredCertificates.length)
  console.log('🎯 Filtros activos:', filters)

  const isPDF = (contentType: string) => contentType === 'application/pdf'

  // Para descargar archivos Base64
  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007A33] to-[#CC8A00] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{user.nombre}</h2>
              <p className="text-sm opacity-90">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar por título..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC8A00]"
            />

            {/* Semestre */}
            <select
              value={filters.semestre}
              onChange={(e) => setFilters({ ...filters, semestre: e.target.value as any })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC8A00]"
            >
              <option value="all">Todos los semestres</option>
              <option value="spring">Primavera (Ene-Jun)</option>
              <option value="fall">Otoño (Jul-Dic)</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC8A00]"
            >
              <option value="date-desc">Más reciente primero</option>
              <option value="date-asc">Más antiguo primero</option>
              <option value="title">Orden alfabético</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#007A33] border-r-transparent"></div>
                <p className="mt-2 text-sm text-slate-600">Cargando certificados...</p>
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-slate-600">No se encontraron certificados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Preview */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {isPDF(cert.contentType) ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                        <svg className="h-20 w-20 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1" />
                        </svg>
                      </div>
                    ) : (
                      <img src={cert.data} alt={cert.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{cert.title}</h3>
                    {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{cert.semesterTerm === 'ene-jun' ? 'Ene-Jun' : 'Jul-Dic'} {cert.year}</span>
                      {cert.hours && <span>• {cert.hours}h</span>}
                    </div>
                    {cert.type && (
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-[#007A33]/10 text-[#007A33]">
                        {cert.type}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleDownload(cert.data, cert.fileName)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-[#007A33] text-white hover:bg-[#CC8A00] transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cert.id)}
                          disabled={deletingId === cert.id}
                          className="rounded-lg px-3 py-2 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {deletingId === cert.id ? (
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Total: <span className="font-semibold">{filteredCertificates.length}</span> {filteredCertificates.length === 1 ? 'certificado' : 'certificados'}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
