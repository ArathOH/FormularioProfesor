import { useState } from 'react'
import type { UserDoc, UserRole } from '../../lib/types'
import { ROLE_OPTIONS } from '../../lib/role'

type UserRoleSelectProps = {
  user: UserDoc
  onSave: (newRole: UserRole) => Promise<void>
  onClose: () => void
}

export default function UserRoleSelect({
  user,
  onSave,
  onClose,
}: UserRoleSelectProps) {
  const [role, setRole] = useState<UserRole>(user.role || 'estudiante')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(role)
      onClose()
    } catch (err) {
      alert('Error al cambiar rol: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Cambiar rol de usuario</h2>
        <p className="text-sm text-gray-600 mb-4">
          Usuario: <strong>{user.nombre || user.email}</strong>
        </p>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">
            Nuevo rol:
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#007A33]"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#007A33] text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
