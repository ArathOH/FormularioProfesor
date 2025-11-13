import type { UserDoc } from '../../lib/types'

type UserRowActionsProps = {
  user: UserDoc
  onViewDetail: () => void
  onChangeRole: () => void
  onToggleActive: () => void
  onDelete: () => void
}

export default function UserRowActions({
  user,
  onViewDetail,
  onChangeRole,
  onToggleActive,
  onDelete,
}: UserRowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onViewDetail}
        className="text-sm text-blue-600 hover:underline"
        title="Ver detalle"
      >
        Ver
      </button>
      <button
        onClick={onChangeRole}
        className="text-sm text-[#007A33] hover:underline"
        title="Cambiar rol"
      >
        Rol
      </button>
      <button
        onClick={onToggleActive}
        className="text-sm text-orange-600 hover:underline"
        title={user.isActive === false ? 'Activar' : 'Desactivar'}
      >
        {user.isActive === false ? 'Activar' : 'Desactivar'}
      </button>
      <button
        onClick={onDelete}
        className="text-sm text-red-600 hover:underline"
        title="Eliminar usuario"
      >
        Eliminar
      </button>
    </div>
  )
}
