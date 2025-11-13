import type { UserRole } from '../../lib/types'

type UsersToolbarProps = {
  roleFilter: UserRole | 'all'
  onRoleChange: (r: UserRole | 'all') => void
  search: string
  onSearchChange: (s: string) => void
  onExport?: () => void
}

export default function UsersToolbar({
  roleFilter,
  onRoleChange,
  search,
  onSearchChange,
  onExport,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 bg-white p-4 rounded shadow">
      <label className="text-sm font-medium text-gray-700">
        Rol:
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value as any)}
          className="ml-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#007A33]"
        >
          <option value="all">Todos</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="invitado">Invitado</option>
          <option value="admin">Administrador</option>
        </select>
      </label>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-[#007A33]"
      />

      {onExport && (
        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-[#CC8A00] text-white rounded hover:opacity-90"
        >
          Exportar CSV
        </button>
      )}
    </div>
  )
}
