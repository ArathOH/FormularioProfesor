interface Props {
  kind?: 'error'|'success'|'info'
  message: string
}
export default function Alert({ kind='info', message }: Props){
  const base = 'rounded-lg px-3 py-2 text-sm border'
  const styles = {
    error: `${base} bg-red-50 text-red-800 border-red-200`,
    success: `${base} bg-emerald-50 text-emerald-800 border-emerald-200`,
    info: `${base} bg-slate-50 text-slate-800 border-slate-200`,
  } as const
  return (
    <div role="status" aria-live="polite" className={styles[kind]}> {message} </div>
  )
}
