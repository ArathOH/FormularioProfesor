type Props = {
  total: number
  departments: number
  yearRange: string
}

export default function ReportKPIs({ total, departments, yearRange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-linear-to-br from-(--uabc-green) to-(--uabc-ochre) p-6 text-white">
        <div className="text-sm font-medium opacity-90">Total de certificados</div>
        <div className="mt-2 text-4xl font-bold">{total}</div>
      </div>
      
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-sm font-medium text-slate-600">Departamentos</div>
        <div className="mt-2 text-4xl font-bold text-(--uabc-green)">{departments}</div>
      </div>
      
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-sm font-medium text-slate-600">Rango de años</div>
        <div className="mt-2 text-2xl font-bold text-(--uabc-ochre)">{yearRange}</div>
      </div>
    </div>
  )
}
