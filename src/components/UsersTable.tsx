import { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { UserWithCertificates } from '../lib/types'
import CertificatesModal from './CertificatesModal'

export default function UsersTable() {
  const [users, setUsers] = useState<UserWithCertificates[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithCertificates | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Esperar a que el usuario esté autenticado
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Verificar si el usuario es admin
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          const userData = userDoc.data()
          // Verificación de rol admin (ya no se necesita guardar en estado)
          console.log('Rol de usuario:', userData?.role)
        } catch (err) {
          console.error('Error verificando rol admin:', err)
        }
        loadUsers()
      } else {
        setLoading(false)
        setError('Debes iniciar sesión para ver esta información')
      }
    })
    return () => unsubscribe()
  }, [])

  const loadUsers = async () => {
    try {
      setError(null)
      console.log('🔄 Cargando usuarios...')
      console.log('👤 Usuario actual:', auth.currentUser?.email)
      
      // 1. Obtener todos los usuarios
      const usersSnap = await getDocs(collection(db, 'users'))
      console.log('✅ Usuarios obtenidos:', usersSnap.size)
      
      const usersData: UserWithCertificates[] = []

      // 2. Para cada usuario, contar certificados
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data()
        
        try {
          // Consultar la colección de certificados docentes
          const certificatesSnap = await getDocs(
            collection(db, 'certificates', userDoc.id, 'items')
          )

          usersData.push({
            uid: userDoc.id,
            nombre: userData.nombre || 'Sin nombre',
            email: userData.email || 'Sin correo',
            certificatesCount: certificatesSnap.size,
          })
        } catch (certErr) {
          // Si no tiene permisos para ver certificados de este usuario, poner 0
          console.warn(`No se pudieron cargar certificados para ${userData.email}:`, certErr)
          usersData.push({
            uid: userDoc.id,
            nombre: userData.nombre || 'Sin nombre',
            email: userData.email || 'Sin correo',
            certificatesCount: 0,
          })
        }
      }

      console.log('✅ Total usuarios cargados:', usersData.length)
      setUsers(usersData)
    } catch (err) {
      console.error('❌ Error loading users:', err)
      setError('Error al cargar usuarios. Verifica tus permisos en Firebase.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--uabc-green)] border-r-transparent"></div>
          <p className="mt-2 text-sm text-slate-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Error de permisos</h3>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <p className="mt-2 text-xs text-slate-500">
            Asegúrate de haber publicado las reglas de Firestore y espera unos minutos.
          </p>
          <button
            onClick={loadUsers}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-medium bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Buscador */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--uabc-green)] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Correo electrónico</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Certificados</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[var(--uabc-green)]/10 flex items-center justify-center text-[var(--uabc-green)] font-semibold">
                            {user.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{user.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--uabc-ochre)]/10 px-3 py-1 text-sm font-medium text-[var(--uabc-ochre)]">
                          {user.certificatesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          disabled={user.certificatesCount === 0}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Ver certificados
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedUser && (
        <CertificatesModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  )
}
