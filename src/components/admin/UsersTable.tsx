import type { UserDoc } from '../../lib/types'
import { getRoleLabel } from '../../lib/role'
import UserRowActions from './UserRowActions'

type UsersTableProps = {
  users: UserDoc[]
  onViewDetail: (u: UserDoc) => void
  onChangeRole: (u: UserDoc) => void
  onToggleActive: (u: UserDoc) => void
  onDelete: (u: UserDoc) => void
}

export default function UsersTable({
  users,
  onViewDetail,
  onChangeRole,
  onToggleActive,
  onDelete,
}: UsersTableProps) {
  if (!users.length) {
    return (
      <div className="bg-white p-8 rounded shadow text-center text-gray-500">
        No se encontraron usuarios.
      </div>
    )
  }

  return (
    <div className="bg-white rounded shadow overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((u) => (
            <tr key={u.uid} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {u.nombre || 'Sin nombre'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {u.email || '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                  {getRoleLabel(u.role)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {u.isActive === false ? (
                  <span className="text-red-600 font-medium">Inactivo</span>
                ) : (
                  <span className="text-green-600 font-medium">Activo</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <UserRowActions
                  user={u}
                  onViewDetail={() => onViewDetail(u)}
                  onChangeRole={() => onChangeRole(u)}
                  onToggleActive={() => onToggleActive(u)}
                  onDelete={() => onDelete(u)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
