import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../lib/role'
import type { UserDoc, UserRole, Certificate } from '../lib/types'
import UsersToolbar from '../components/admin/UsersToolbar'
import UsersTable from '../components/admin/UsersTable'
import UserRoleSelect from '../components/admin/UserRoleSelect'
import UserDetail from '../components/admin/UserDetail'
import CertEditModal from '../components/admin/CertEditModal'
import { exportToCSV } from '../lib/csv'

const PAGE_SIZE = 20

export default function Admin() {
  const { userRole } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Filtros
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [search, setSearch] = useState('')

  // Modales
  const [selectedForRole, setSelectedForRole] = useState<UserDoc | null>(null)
  const [selectedForDetail, setSelectedForDetail] = useState<UserDoc | null>(null)
  const [selectedForDelete, setSelectedForDelete] = useState<UserDoc | null>(null)
  const [selectedCertEdit, setSelectedCertEdit] = useState<{
    cert: Certificate
    userId: string
  } | null>(null)
  const [selectedCertDelete, setSelectedCertDelete] = useState<{
    cert: Certificate
    userId: string
  } | null>(null)

  useEffect(() => {
    if (!isAdmin(userRole || undefined)) {
      navigate('/403', { replace: true })
      return
    }
    loadUsers(null)
  }, [userRole, navigate])

  async function loadUsers(cursor: QueryDocumentSnapshot<DocumentData> | null) {
    setLoading(true)
    try {
      let q = query(collection(db, 'users'), limit(PAGE_SIZE + 1))
      if (cursor) {
        q = query(collection(db, 'users'), startAfter(cursor), limit(PAGE_SIZE + 1))
      }

      const snap = await getDocs(q)
      const docs = snap.docs
      const hasMoreData = docs.length > PAGE_SIZE
      const displayDocs = hasMoreData ? docs.slice(0, PAGE_SIZE) : docs

      const list = displayDocs.map((d) => ({ ...d.data(), uid: d.id } as UserDoc))
      setUsers(list)
      setLastDoc(hasMoreData ? displayDocs[displayDocs.length - 1] : null)
      setHasMore(hasMoreData)
    } catch (err) {
      console.error(err)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  function loadNext() {
    if (!lastDoc || !hasMore) return
    loadUsers(lastDoc)
  }

  async function handleChangeRole(user: UserDoc, newRole: UserRole) {
    const docRef = doc(db, 'users', user.uid)
    await updateDoc(docRef, { role: newRole, updatedAt: new Date().toISOString() })
    loadUsers(null) // Recargar
  }

  async function handleToggleActive(user: UserDoc) {
    const newActive = !(user.isActive === false)
    const docRef = doc(db, 'users', user.uid)
    await updateDoc(docRef, { isActive: newActive, updatedAt: new Date().toISOString() })
    loadUsers(null)
  }

  async function handleDeleteUser(user: UserDoc) {
    try {
      // Eliminar documentos de certificados
      const certsSnap = await getDocs(collection(db, 'certificates', user.uid, 'items'))
      for (const certDoc of certsSnap.docs) {
        await deleteDoc(doc(db, 'certificates', user.uid, 'items', certDoc.id))
      }
      // Eliminar documento de usuario
      await deleteDoc(doc(db, 'users', user.uid))
      alert('Usuario eliminado correctamente')
      loadUsers(null)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar usuario: ' + (err as Error).message)
    }
  }

  async function handleDeleteCert(cert: Certificate, userId: string) {
    try {
      await deleteDoc(doc(db, 'certificates', userId, 'items', cert.id))
      alert('Certificado eliminado correctamente')
      setSelectedCertDelete(null)
      if (selectedForDetail) {
        // Recargar detalle
        setSelectedForDetail({ ...selectedForDetail })
      }
    } catch (err) {
      console.error(err)
      alert('Error al eliminar certificado: ' + (err as Error).message)
    }
  }

  function handleExportCSV() {
    const data = filteredUsers.map((u) => ({
      UID: u.uid,
      Nombre: u.nombre || '',
      Email: u.email || '',
      Rol: u.role || '',
      Estado: u.isActive === false ? 'Inactivo' : 'Activo',
    }))
    exportToCSV(data, 'usuarios.csv')
  }

  // Filtrar usuarios
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    const s = search.toLowerCase()
    if (
      s &&
      !(u.nombre?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
    ) {
      return false
    }
    return true
  })

  if (!isAdmin(userRole || undefined)) {
    return null // Ya redirige en useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-uabc-green">
          Panel de Administración
        </h1>

        <UsersToolbar
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          search={search}
          onSearchChange={setSearch}
          onExport={handleExportCSV}
        />

        {loading && (
          <p className="text-gray-500 text-center py-8">Cargando usuarios...</p>
        )}

        {!loading && (
          <>
            <UsersTable
              users={filteredUsers}
              onViewDetail={setSelectedForDetail}
              onChangeRole={setSelectedForRole}
              onToggleActive={handleToggleActive}
              onDelete={setSelectedForDelete}
            />

            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadNext}
                  className="px-4 py-2 bg-uabc-green text-white rounded hover:opacity-90"
                >
                  Cargar más usuarios
                </button>
              </div>
            )}
          </>
        )}

        {/* Modales */}
        {selectedForRole && (
          <UserRoleSelect
            user={selectedForRole}
            onSave={(newRole) => handleChangeRole(selectedForRole, newRole)}
            onClose={() => setSelectedForRole(null)}
          />
        )}

        {selectedForDetail && (
          <UserDetail
            user={selectedForDetail}
            onClose={() => setSelectedForDetail(null)}
            onEditCert={(cert) =>
              setSelectedCertEdit({ cert, userId: selectedForDetail.uid })
            }
            onDeleteCert={(cert) =>
              setSelectedCertDelete({ cert, userId: selectedForDetail.uid })
            }
          />
        )}

        {selectedCertEdit && (
          <CertEditModal
            cert={selectedCertEdit.cert}
            userId={selectedCertEdit.userId}
            onClose={() => setSelectedCertEdit(null)}
            onSaved={() => {
              setSelectedCertEdit(null)
              if (selectedForDetail) {
                setSelectedForDetail({ ...selectedForDetail })
              }
            }}
          />
        )}

        {selectedForDelete && (
          <ConfirmDeleteUser
            user={selectedForDelete}
            onConfirm={() => {
              handleDeleteUser(selectedForDelete)
              setSelectedForDelete(null)
            }}
            onCancel={() => setSelectedForDelete(null)}
          />
        )}

        {selectedCertDelete && (
          <ConfirmDeleteCert
            cert={selectedCertDelete.cert}
            onConfirm={() =>
              handleDeleteCert(selectedCertDelete.cert, selectedCertDelete.userId)
            }
            onCancel={() => setSelectedCertDelete(null)}
          />
        )}
      </div>
    </div>
  )
}

// Modal de confirmación para eliminar usuario
function ConfirmDeleteUser({
  user,
  onConfirm,
  onCancel,
}: {
  user: UserDoc
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Eliminar usuario</h2>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de eliminar al usuario{' '}
          <strong>{user.nombre || user.email}</strong>? Esta acción también
          eliminará todos sus certificados.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de confirmación para eliminar certificado
function ConfirmDeleteCert({
  cert,
  onConfirm,
  onCancel,
}: {
  cert: Certificate
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Eliminar certificado</h2>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de eliminar el certificado "<strong>{cert.title}</strong>"?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
