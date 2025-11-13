import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Certificate, CertificateType, DepartmentType, SemesterTerm } from '../lib/types'
import { exportToCSV } from '../lib/csv'
import ReportFilters from '../components/reports/ReportFilters'
import ReportKPIs from '../components/reports/ReportKPIs'
import DeptBarChart from '../components/reports/DeptBarChart'
import TypePieChart from '../components/reports/TypePieChart'
import ReportTable from '../components/reports/ReportTable'

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

export default function Reports() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState<SemesterTerm | ''>('')
  const [department, setDepartment] = useState<DepartmentType | ''>('')
  const [type, setType] = useState<CertificateType | ''>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Primero obtenemos todos los usuarios
        const usersSnap = await getDocs(collection(db, 'users'))
        const allCerts: Certificate[] = []
        
        // Para cada usuario, obtenemos sus certificados
        for (const userDoc of usersSnap.docs) {
          const userId = userDoc.id
          const certsSnap = await getDocs(collection(db, 'certificates', userId, 'items'))
          certsSnap.docs.forEach(doc => {
            allCerts.push(doc.data() as Certificate)
          })
        }
        
        setCertificates(allCerts)
      } catch (err) {
        console.error('Error al cargar certificados:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Filtrar certificados
  const filtered = useMemo(() => {
    let result = certificates
    if (year) result = result.filter(c => c.year === Number(year))
    if (semester) result = result.filter(c => c.semesterTerm === semester)
    if (department) result = result.filter(c => c.department === department)
    if (type) result = result.filter(c => c.type === type)
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c => 
        c.title.toLowerCase().includes(s) ||
        (c.description?.toLowerCase().includes(s)) ||
        (c.issuer?.toLowerCase().includes(s))
      )
    }
    return result
  }, [certificates, year, semester, department, type, search])

  // KPIs
  const total = filtered.length
  const depts = new Set(filtered.map(c => c.department))
  const departments = depts.size
  const years = filtered.map(c => c.year)
  const yearRange = years.length > 0 
    ? `${Math.min(...years)}–${Math.max(...years)}`
    : '—'

  // Datos para gráficas
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(c => {
      const label = c.department === 'otro' && c.departmentOther
        ? c.departmentOther
        : DEPT_LABELS[c.department] || c.department
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(c => {
      const label = c.type === 'otro' && c.typeOther
        ? c.typeOther
        : TYPE_LABELS[c.type] || c.type
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const handleExport = () => {
    const rows = filtered.map(c => ({
      Título: c.title,
      Tipo: c.type === 'otro' && c.typeOther ? c.typeOther : TYPE_LABELS[c.type] || c.type,
      Departamento: c.department === 'otro' && c.departmentOther 
        ? c.departmentOther 
        : DEPT_LABELS[c.department] || c.department,
      Año: c.year,
      Semestre: c.semesterTerm === 'ene-jun' ? 'Ene–Jun' : 'Jul–Dic',
      Emisor: c.issuer || '',
      Descripción: c.description || '',
      Horas: c.hours || '',
      Modalidad: c.modality || '',
      'Fecha de emisión': c.issuedOn || '',
    }))
    exportToCSV(rows, 'reporte_certificados_uabc.csv')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-slate-600">Cargando certificados…</div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reportes Estadísticos</h1>
        <button
          onClick={handleExport}
          className="rounded-xl bg-(--uabc-green) text-white px-4 py-2 hover:bg-(--uabc-ochre) focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)"
        >
          Exportar CSV
        </button>
      </div>

      <ReportFilters
        year={year}
        semester={semester}
        department={department}
        type={type}
        search={search}
        onYearChange={setYear}
        onSemesterChange={setSemester}
        onDepartmentChange={setDepartment}
        onTypeChange={setType}
        onSearchChange={setSearch}
      />

      <ReportKPIs total={total} departments={departments} yearRange={yearRange} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeptBarChart data={deptData} />
        <TypePieChart data={typeData} />
      </div>

      <ReportTable certificates={filtered} />
    </div>
  )
}
