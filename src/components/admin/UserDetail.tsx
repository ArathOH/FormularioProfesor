import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Certificate, UserDoc } from '../../lib/types'
import { getRoleLabel } from '../../lib/role'
import { fmtDate } from '../../lib/date'
import UserCertList from './UserCertList'

type UserDetailProps = {
  user: UserDoc
  onClose: () => void
  onEditCert: (cert: Certificate) => void
  onDeleteCert: (cert: Certificate) => void
}

export default function UserDetail({
  user,
  onClose,
  onEditCert,
  onDeleteCert,
}: UserDetailProps) {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCerts()
  }, [user.uid])

  async function loadCerts() {
    setLoading(true)
    try {
      const snap = await getDocs(
        collection(db, 'certificates', user.uid, 'items')
      )
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Certificate))
      setCerts(list)
    } catch (err) {
      console.error(err)
      alert('Error al cargar certificados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {user.nombre || 'Sin nombre'}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {user.email || '—'}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Rol:</strong> {getRoleLabel(user.role)}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Estado:</strong>{' '}
              {user.isActive === false ? (
                <span className="text-red-600">Inactivo</span>
              ) : (
                <span className="text-green-600">Activo</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Última actualización:</strong> {fmtDate(user.updatedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Certificados ({certs.length})
          </h3>
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <UserCertList
              certs={certs}
              onEdit={onEditCert}
              onDelete={onDeleteCert}
            />
          )}
        </div>
      </div>
    </div>
  )
}
