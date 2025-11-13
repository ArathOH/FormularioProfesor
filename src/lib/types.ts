export type UploadCategory = 'general' | 'certificate'

export type Semestre = 'spring' | 'fall' // spring: Ene-Jun, fall: Jul-Dic

export type UserRole = 'estudiante' | 'docente' | 'invitado' | 'admin'

export type UserProfile = {
  nombre?: string
  telefono?: string
  bio?: string
  email?: string
  role?: UserRole
  avatarB64?: string // imagen reescalada en base64 (<= ~128KB)
  updatedAt?: unknown
}

export type UserDoc = {
  uid: string
  nombre?: string
  email?: string
  telefono?: string
  role?: UserRole
  avatarB64?: string
  isActive?: boolean
  updatedAt?: any
}

export type UploadItem = {
  id: string
  title?: string // Título del certificado (opcional por ahora)
  name: string // Nombre del archivo
  data: string // Base64 data URL (data:image/png;base64,...)
  size: number
  contentType: string
  category?: UploadCategory
  userId: string // ID del usuario propietario
  uploadDate?: string // Fecha de emisión del certificado (opcional)
  semestre?: Semestre // Semestre académico (opcional)
  createdAt: string
}

export type UserWithCertificates = {
  uid: string
  nombre: string
  email: string
  certificatesCount: number
}

// === Certificados para docentes ===

export type SemesterTerm = 'ene-jun' | 'jul-dic'

export type CertificateType =
 | 'diplomado'
 | 'curso-actualizacion'
 | 'taller-didactico'
 | 'seminario-investigacion'
 | 'congreso'
 | 'ponencia'
 | 'publicacion'
 | 'certificacion-competencias'
 | 'mooc'
 | 'asesoria-tesis'
 | 'reconocimiento-uabc'
 | 'otro'

export type DepartmentType =
 | 'ciencias-educacion'
 | 'ingenieria'
 | 'humanidades'
 | 'ciencias-salud'
 | 'artes'
 | 'deportes'
 | 'administracion'
 | 'economia'
 | 'juridicas'
 | 'otro'

export type Certificate = {
  id: string
  title: string
  type: CertificateType
  typeOther?: string
  department: DepartmentType
  departmentOther?: string
  description?: string
  issuer?: string
  modality?: 'presencial'|'en-linea'|'mixta'
  hours?: number
  semesterTerm: SemesterTerm
  year: number
  issuedOn?: string // YYYY-MM-DD
  fileName: string
  contentType: string
  size: number // bytes
  data: string  // Base64 dataURL
  createdAt?: unknown
  updatedAt?: unknown
}
