import type { UserRole } from './types'

export function isAdmin(role?: string): boolean {
  return role === 'admin'
}

export function canEditUsers(role?: string): boolean {
  return isAdmin(role)
}

export function canDeleteCertificates(role?: string): boolean {
  return isAdmin(role)
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  docente: 'Docente',
  estudiante: 'Estudiante',
  invitado: 'Invitado',
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'invitado', label: 'Invitado' },
  { value: 'admin', label: 'Administrador' },
]

export function getRoleLabel(role?: string): string {
  const labels: Record<string, string> = {
    'admin': 'Administrador',
    'docente': 'Docente',
    'estudiante': 'Estudiante',
    'invitado': 'Invitado',
  }
  return labels[role || ''] || 'Sin rol'
}
