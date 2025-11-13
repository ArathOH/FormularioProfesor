import { useState } from 'react'
import type { Certificate } from '../../lib/types'

type Props = {
  certificates: Certificate[]
}

const ROWS_PER_PAGE = 20

const DEPT_LABELS: Record<string, string> = {
  'ciencias-educacion': 'Ciencias de la Educación',
  'ingenieria': 'Ingeniería',
  'humanidades': 'Humanidades',
  'ciencias-salud': 'Ciencias de la Salud',
  'artes': 'Artes',
  'deportes': 'Deportes',
  'administracion': 'Administración',
  'economia': 'Economía',
  'juridicas': 'Jurídicas',
  'otro': 'Otro',
}

const TYPE_LABELS: Record<string, string> = {
  'diplomado': 'Diplomado',
  'curso-actualizacion': 'Curso de actualización',
  'taller-didactico': 'Taller didáctico',
  'seminario-investigacion': 'Seminario de investigación',
  'congreso': 'Congreso/Simposio',
  'ponencia': 'Ponencia/Cartel',
  'publicacion': 'Publicación',
  'certificacion-competencias': 'Certificación de competencias',
  'mooc': 'Curso en línea (MOOC)',
  'asesoria-tesis': 'Asesoría/Comité de tesis',
  'reconocimiento-uabc': 'Reconocimiento UABC',
  'otro': 'Otro',
}

export default function ReportTable({ certificates }: Props) {
  const [page, setPage] = useState(0)
  
  const totalPages = Math.ceil(certificates.length / ROWS_PER_PAGE)
  const start = page * ROWS_PER_PAGE
  const end = start + ROWS_PER_PAGE
  const current = certificates.slice(start, end)

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Todos los certificados ({certificates.length})</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Tipo</th>
              <th className="p-3 font-medium">Departamento</th>
              <th className="p-3 font-medium">Año</th>
              <th className="p-3 font-medium">Semestre</th>
              <th className="p-3 font-medium">Emisor</th>
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No hay certificados que coincidan con los filtros
                </td>
              </tr>
            ) : (
              current.map((cert) => (
                <tr key={cert.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{cert.title}</td>
                  <td className="p-3">
                    {TYPE_LABELS[cert.type] || cert.type}
                    {cert.type === 'otro' && cert.typeOther && ` (${cert.typeOther})`}
                  </td>
                  <td className="p-3">
                    {DEPT_LABELS[cert.department] || cert.department}
                    {cert.department === 'otro' && cert.departmentOther && ` (${cert.departmentOther})`}
                  </td>
                  <td className="p-3">{cert.year}</td>
                  <td className="p-3">{cert.semesterTerm === 'ene-jun' ? 'Ene–Jun' : 'Jul–Dic'}</td>
                  <td className="p-3">{cert.issuer || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Página {page + 1} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-lg border px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
