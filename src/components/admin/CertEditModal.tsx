import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Certificate, CertificateType, DepartmentType, SemesterTerm } from '../../lib/types'

const CERT_TYPES: { value: CertificateType; label: string }[] = [
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'curso-actualizacion', label: 'Curso de Actualización' },
  { value: 'taller-didactico', label: 'Taller Didáctico' },
  { value: 'seminario-investigacion', label: 'Seminario de Investigación' },
  { value: 'congreso', label: 'Congreso' },
  { value: 'ponencia', label: 'Ponencia' },
  { value: 'publicacion', label: 'Publicación' },
  { value: 'certificacion-competencias', label: 'Certificación de Competencias' },
  { value: 'mooc', label: 'MOOC' },
  { value: 'asesoria-tesis', label: 'Asesoría de Tesis' },
  { value: 'reconocimiento-uabc', label: 'Reconocimiento UABC' },
  { value: 'otro', label: 'Otro' },
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

type CertEditModalProps = {
  cert: Certificate
  userId: string
  onClose: () => void
  onSaved: () => void
}

export default function CertEditModal({
  cert,
  userId,
  onClose,
  onSaved,
}: CertEditModalProps) {
  const [title, setTitle] = useState(cert.title || '')
  const [type, setType] = useState<CertificateType>(cert.type)
  const [typeOther, setTypeOther] = useState(cert.typeOther || '')
  const [department, setDepartment] = useState<DepartmentType>(cert.department)
  const [departmentOther, setDepartmentOther] = useState(cert.departmentOther || '')
  const [description, setDescription] = useState(cert.description || '')
  const [issuer, setIssuer] = useState(cert.issuer || '')
  const [modality, setModality] = useState<'presencial'|'en-linea'|'mixta'>(cert.modality || 'presencial')
  const [hours, setHours] = useState(cert.hours || 0)
  const [semesterTerm, setSemesterTerm] = useState<SemesterTerm>(cert.semesterTerm)
  const [year, setYear] = useState(cert.year)
  const [issuedOn, setIssuedOn] = useState(cert.issuedOn || '')

  const [newFile, setNewFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 0.9 * 1024 * 1024) {
      alert('El archivo debe ser ≤ 0.9 MB')
      e.target.value = ''
      return
    }
    setNewFile(f)
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('El título es obligatorio')
      return
    }

    setSaving(true)
    try {
      const updates: any = {
        title: title.trim(),
        type,
        typeOther: type === 'otro' ? typeOther : '',
        department,
        departmentOther: department === 'otro' ? departmentOther : '',
        description,
        issuer,
        modality,
        hours,
        semesterTerm,
        year,
        issuedOn,
        updatedAt: new Date().toISOString(),
      }

      // Si hay un archivo nuevo, convertir a Base64
      if (newFile) {
        const b64 = await toBase64(newFile)
        updates.data = b64
        updates.fileName = newFile.name
        updates.contentType = newFile.type
        updates.size = newFile.size
      }

      const docRef = doc(db, 'certificates', userId, 'items', cert.id)
      await updateDoc(docRef, updates)
      alert('Certificado actualizado correctamente')
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error al actualizar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Editar Certificado</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Título *
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Tipo *</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CertificateType)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            >
              {CERT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {type === 'otro' && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Especificar tipo
              </span>
              <input
                type="text"
                value={typeOther}
                onChange={(e) => setTypeOther(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Departamento *
            </span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentType)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          {department === 'otro' && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Especificar departamento
              </span>
              <input
                type="text"
                value={departmentOther}
                onChange={(e) => setDepartmentOther(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Emisor</span>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Modalidad</span>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as any)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            >
              <option value="presencial">Presencial</option>
              <option value="en-linea">En línea</option>
              <option value="mixta">Mixta</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Horas</span>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Periodo *
              </span>
              <select
                value={semesterTerm}
                onChange={(e) => setSemesterTerm(e.target.value as SemesterTerm)}
                className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
              >
                <option value="ene-jun">Ene-Jun</option>
                <option value="jul-dic">Jul-Dic</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Año *</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Fecha de emisión (YYYY-MM-DD)
            </span>
            <input
              type="date"
              value={issuedOn}
              onChange={(e) => setIssuedOn(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-uabc-green"
            />
          </label>

          <div className="border-t pt-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Reemplazar archivo (≤ 0.9 MB)
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="mt-1 block w-full text-sm text-gray-500"
              />
              {newFile && (
                <p className="text-xs text-green-600 mt-1">
                  Nuevo archivo seleccionado: {newFile.name}
                </p>
              )}
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
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
            className="px-4 py-2 bg-uabc-green text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
