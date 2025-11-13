import type { CertificateType, DepartmentType, SemesterTerm } from '../../lib/types'

type Props = {
  year: string
  semester: SemesterTerm | ''
  department: DepartmentType | ''
  type: CertificateType | ''
  search: string
  onYearChange: (v: string) => void
  onSemesterChange: (v: SemesterTerm | '') => void
  onDepartmentChange: (v: DepartmentType | '') => void
  onTypeChange: (v: CertificateType | '') => void
  onSearchChange: (v: string) => void
}

const TYPES: { value: CertificateType; label: string }[] = [
  { value:'diplomado', label:'Diplomado' },
  { value:'curso-actualizacion', label:'Curso de actualización' },
  { value:'taller-didactico', label:'Taller didáctico' },
  { value:'seminario-investigacion', label:'Seminario de investigación' },
  { value:'congreso', label:'Congreso/Simposio' },
  { value:'ponencia', label:'Ponencia/Cartel' },
  { value:'publicacion', label:'Publicación' },
  { value:'certificacion-competencias', label:'Certificación de competencias' },
  { value:'mooc', label:'Curso en línea (MOOC)' },
  { value:'asesoria-tesis', label:'Asesoría/Comité de tesis' },
  { value:'reconocimiento-uabc', label:'Reconocimiento UABC' },
  { value:'otro', label:'Otro' },
]

const DEPARTMENTS: { value: DepartmentType; label: string }[] = [
  { value: 'ciencias-educacion', label: 'Ciencias de la Educación' },
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'humanidades', label: 'Humanidades' },
  { value: 'ciencias-salud', label: 'Ciencias de la Salud' },
  { value: 'artes', label: 'Artes' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'administracion', label: 'Administración' },
  { value: 'economia', label: 'Economía' },
  { value: 'juridicas', label: 'Jurídicas' },
  { value: 'otro', label: 'Otro' },
]

export default function ReportFilters({
  year, semester, department, type, search,
  onYearChange, onSemesterChange, onDepartmentChange, onTypeChange, onSearchChange
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Filtros</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-1">
          <label htmlFor="filterYear" className="text-sm font-medium">Año</label>
          <input
            id="filterYear"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={e => onYearChange(e.target.value)}
            className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
            placeholder="Todos los años"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="filterSemester" className="text-sm font-medium">Semestre</label>
          <select
            id="filterSemester"
            value={semester}
            onChange={e => onSemesterChange(e.target.value as any)}
            className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
          >
            <option value="">Todos</option>
            <option value="ene-jun">Ene–Jun</option>
            <option value="jul-dic">Jul–Dic</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="filterDept" className="text-sm font-medium">Departamento</label>
          <select
            id="filterDept"
            value={department}
            onChange={e => onDepartmentChange(e.target.value as any)}
            className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
          >
            <option value="">Todos</option>
            {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="filterType" className="text-sm font-medium">Tipo</label>
          <select
            id="filterType"
            value={type}
            onChange={e => onTypeChange(e.target.value as any)}
            className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
          >
            <option value="">Todos</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="grid gap-1 sm:col-span-2">
          <label htmlFor="filterSearch" className="text-sm font-medium">Buscar</label>
          <input
            id="filterSearch"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
            placeholder="Título, emisor, descripción…"
          />
        </div>
      </div>
    </div>
  )
}
