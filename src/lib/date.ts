/**
 * Formatea un timestamp de Firestore a fecha legible
 */
export function fmtDate(ts: any): string {
  if (!ts) return '—'
  let d: Date
  if (typeof ts === 'object' && 'toDate' in ts) {
    d = ts.toDate()
  } else if (ts instanceof Date) {
    d = ts
  } else {
    return '—'
  }
  return d.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
