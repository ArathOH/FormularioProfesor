import type { Certificate } from '../../lib/types'
import { fmtDate } from '../../lib/date'

type UserCertListProps = {
  certs: Certificate[]
  onEdit: (cert: Certificate) => void
  onDelete: (cert: Certificate) => void
}

export default function UserCertList({
  certs,
  onEdit,
  onDelete,
}: UserCertListProps) {
  if (!certs.length) {
    return (
      <p className="text-gray-500 text-sm">
        Este usuario no tiene certificados aún.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      {certs.map((cert) => (
        <div
          key={cert.id}
          className="border rounded p-3 hover:bg-gray-50 flex items-start justify-between"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{cert.title}</h4>
            <p className="text-xs text-gray-600 mb-1">
              <strong>Tipo:</strong> {cert.type || '—'}{' '}
              <strong>Depto:</strong> {cert.department || '—'}
            </p>
            <p className="text-xs text-gray-600 mb-1">
              <strong>Horas:</strong> {cert.hours || 0} | <strong>Año:</strong>{' '}
              {cert.year || '—'} | <strong>Periodo:</strong>{' '}
              {cert.semesterTerm || '—'}
            </p>
            <p className="text-xs text-gray-500">
              Subido: {fmtDate(cert.createdAt)}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(cert)}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(cert)}
              className="text-sm text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
